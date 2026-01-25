// I created this service to handle AI-powered task generation using xAI (Grok)
// I'm using HttpClient for direct API access to ensure compatibility with xAI's endpoints
// I'm using .NET 9's primary constructor feature to inject dependencies

namespace TasclyBackend.API.Services;

using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using TasclyBackend.API.Models;
using TasclyBackend.API.Repositories;

// I'm using a primary constructor to inject dependencies
public class AiTaskService(
    HttpClient httpClient,               // I inject HttpClient for making API requests
    IConfiguration configuration,        // I need config for the API key and endpoint
    ITeamMemberRepository teamRepo       // I need team data for assignee suggestions
) : IAiTaskService
{
    // I'm implementing the interface method to generate details tasks
    public async Task<List<DraftTask>> GenerateTasksFromPrompt(
        string prompt, 
        int projectId,
        string mode)
    {
        // I'm getting xAI configuration from appsettings.json
        var apiKey = configuration["AI:ApiKey"];
        var endpoint = configuration["AI:Endpoint"] ?? "https://api.x.ai/v1/chat/completions";
        var model = configuration["AI:Model"] ?? "grok-4-latest";

        if (string.IsNullOrEmpty(apiKey))
        {
            throw new Exception("AI API Key is not configured.");
        }

        // I'm getting team members to provide context to the AI
        var teamMembers = await teamRepo.GetByProjectIdAsync(projectId);
        var systemPrompt = BuildSystemPrompt(teamMembers, mode);

        // I'm setting up the HTTP headers
        httpClient.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", apiKey);

        // I'm creating the request body for the OpenAI-compatible xAI API
        var requestBody = new
        {
            messages = new[]
            {
                new { role = "system", content = systemPrompt },
                new { role = "user", content = prompt }
            },
            model = model,
            stream = false,
            temperature = 0,
            response_format = new { type = "json_object" } // Grok supports JSON mode
        };

        try 
        {
            // I'm sending the POST request to xAI
            var response = await httpClient.PostAsJsonAsync(endpoint, requestBody);
            
            // I'm ensuring the request was successful
            response.EnsureSuccessStatusCode();

            // I'm parsing the response
            var jsonResponse = await response.Content.ReadFromJsonAsync<XAiChatCompletionResponse>();
            
            if (jsonResponse?.Choices == null || jsonResponse.Choices.Length == 0)
            {
                throw new Exception("No response received from AI provider.");
            }

            var content = jsonResponse.Choices[0].Message.Content;
            
            // I'm deserializing the content content into my task structure
            // Using case-insensitive options to be safe
            var options = new JsonSerializerOptions 
            { 
                PropertyNameCaseInsensitive = true 
            };
            
            var result = JsonSerializer.Deserialize<AiTaskResponse>(content, options);
            return result?.Tasks ?? new List<DraftTask>();
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"AI Generation Error: {ex.Message}");
            throw; // Re-throw to be handled by controller
        }
    }

    private string BuildSystemPrompt(List<TeamMember> teamMembers, string mode)
    {
        var teamInfo = string.Join(", ", teamMembers.Select(m => 
            $"{m.Name} ({m.Role}, Skills: {m.Skills ?? "None"})"
        ));
        
        var modeContext = mode.ToLower() == "business" 
            ? "You are managing a physical business (e.g., Office, Hospitality, Retail). Tasks should be operational, like 'Restock inventory', 'Prepare conference room', or 'Schedule staff shift'. Use terminology suitable for general business operations."
            : "You are managing a software project (Project Mode). Tasks should be technical, like 'Implement authentication', 'Run unit tests', or 'Design database schema'. Use software development lifecycle terminology (Sprints, QA, Dev).";

        return $@"You are an expert task manager. {modeContext}

Your goal is to break down the user request into concrete, actionable tasks.

AVAILABLE TEAM:
{teamInfo}

REQUIRED JSON OUTPUT FORMAT:
{{
  ""tasks"": [
    {{
      ""tempId"": 1,
      ""title"": ""Actionable Title"",
      ""description"": ""Detailed description"",
      ""priority"": ""High"" | ""Medium"" | ""Low"",
      ""estimatedHours"": number,
      ""suggestedAssignee"": ""Team Name"" or null,
      ""type"": ""Feature"" | ""Bug"" | ""Improvement""
    }}
  ]
}}
Strictly return valid JSON only.";
    }

    // internal classes for deserializing the xAI API response
    private class XAiChatCompletionResponse
    {
        [JsonPropertyName("choices")]
        public XAiChoice[]? Choices { get; set; }
    }

    private class XAiChoice
    {
        [JsonPropertyName("message")]
        public XAiMessage? Message { get; set; }
    }

    private class XAiMessage
    {
        [JsonPropertyName("content")]
        public string? Content { get; set; }
    }
}
