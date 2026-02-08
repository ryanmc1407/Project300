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
        // I'm getting Groq configuration from appsettings.json
        var apiKey = configuration["AI:ApiKey"];
        var endpoint = configuration["AI:Endpoint"] ?? "https://api.groq.com/openai/v1/chat/completions";
        var model = configuration["AI:Model"] ?? "llama3-70b-8192";

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

            // I'm creating the request body for the OpenAI-compatible Groq API
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
            response_format = new { type = "json_object" } // Groq supports JSON mode for Llama3
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
                PropertyNameCaseInsensitive = true,
                NumberHandling = JsonNumberHandling.AllowReadingFromString
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
        // I'm providing the current time so the AI can resolve relative dates like "Monday" or "Today"
        var currentTime = DateTime.Now.ToString("f"); // Full date/short time

        // I'm listing team members with their exact names as stored in our database
        var teamInfo = string.Join("\n", teamMembers.Select(m => 
            $"- Name: \"{m.Name}\" (Role: {m.Role}, Email: {m.Email}, Skills: {m.Skills ?? "None"})"
        ));
        
        // I'm building the system prompt based on the mode
        var modeContext = mode == "Business" 
            ? @"You are helping manage a hospitality or office business. Tasks should focus on operations, customer service, events, and business processes."
            : @"You are helping manage a software or technical project. Tasks should focus on features, bugs, and improvements.";

        return $@"You are an AI task breakdown assistant. {modeContext}

CURRENT TIME: {currentTime}

Your goal is to break down the user request into concrete, actionable tasks.

AVAILABLE TEAM (USE THE EXACT NAME LISTED):
{teamInfo}

TEMPORAL AWARENESS:
- Use the CURRENT TIME: {currentTime} as your anchor for all relative dates.
- If the user says ""Monday"", ""Tuesday"", etc., calculate the NEXT occurrence of that day from the CURRENT TIME.
- Example: If today is Sunday Feb 8, ""Monday"" must be Feb 9, 2026.
- If a specific time is mentioned (e.g., ""2:00 p.m.""), populate 'scheduledStart'.
- If a deadline is mentioned (e.g., ""by 5:00 p.m.""), populate 'dueDate'.
- Format all dates as ISO 8601 (e.g., ""2026-02-09T14:00:00"").

REQUIRED JSON OUTPUT FORMAT:
{{
  ""tasks"": [
    {{
      ""tempId"": 1,
      ""title"": ""Actionable Title"",
      ""description"": ""Detailed description"",
      ""priority"": ""High"" | ""Medium"" | ""Low"",
      ""estimatedHours"": number,
      ""suggestedAssignee"": ""Exact Name from Available Team"" or null,
      ""type"": ""Feature"" | ""Bug"" | ""Improvement"",
      ""scheduledStart"": ""ISO8601 Date String"" or null,
      ""dueDate"": ""ISO8601 Date String"" or null
    }}
  ]
}}

IMPORTANT: 
1. The 'type' field must be EXACTLY one of: ""Feature"", ""Bug"", or ""Improvement"".
2. The 'suggestedAssignee' MUST EXACTLY match one of the Names provided in the AVAILABLE TEAM list (case-sensitive).
3. Populate 'scheduledStart' if a specific start time is mentioned. Populate 'dueDate' if a deadline is mentioned.
4. If no time is mentioned, leave those fields null.

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
