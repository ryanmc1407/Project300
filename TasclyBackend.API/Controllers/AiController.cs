// I created this controller to handle AI-powered task generation endpoints
// I'm using .NET 9's primary constructor to inject my dependencies
// This controller is the bridge between the frontend and my AI services

namespace TasclyBackend.API.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TasclyBackend.API.Models;
using TasclyBackend.API.Services;
using TasclyBackend.API.Repositories;

[ApiController]
[Route("api/[controller]")]
[Authorize]  // I'm requiring authentication for all endpoints in this controller
public class AiController(
    IAiTaskService aiTaskService,      // I inject the AI service for task generation
    ITaskBulkRepository taskBulkRepo   // I inject the bulk repository for creating tasks
) : ControllerBase
{
    // I created this endpoint to generate draft tasks from a natural language prompt
    // This is the main AI feature that converts ideas into structured tasks
    [HttpPost("generate-tasks")]
    public async Task<ActionResult<AiTaskResponse>> GenerateTasks(
        [FromBody] AiTaskRequest request)
    {
        try
        {
            // I'm validating the request to make sure it has the required data
            if (string.IsNullOrWhiteSpace(request.Prompt))
            {
                // I'm returning a 400 Bad Request if the prompt is empty
                return BadRequest(new { error = "Prompt cannot be empty" });
            }
            
            // I'm calling the AI service to generate the draft tasks
            // This might take a few seconds as it calls the OpenAI API
            var draftTasks = await aiTaskService.GenerateTasksFromPrompt(
                request.Prompt, 
                request.ProjectId,
                request.Mode
            );
            
            // I'm wrapping the tasks in a response object
            // I could add confidence scores and notes here in the future
            var response = new AiTaskResponse(
                Tasks: draftTasks,
                Confidence: null,  // I could calculate this based on AI response
                Notes: null        // I could add helpful tips for the user
            );
            
            // I'm returning a 200 OK with the generated tasks
            return Ok(response);
        }
        catch (Exception ex)
        {
            // I'm logging the error for debugging
            Console.Error.WriteLine($"AI task generation error: {ex.Message}");
            
            // I'm returning a 500 Internal Server Error with a user-friendly message
            return StatusCode(500, new 
            { 
                error = "Failed to generate tasks. Please try again.",
                details = ex.Message  // I might remove this in production for security
            });
        }
    }
    
    // I created this endpoint to bulk create tasks after the user approves them
    // This takes the draft tasks and saves them to the database
    [HttpPost("tasks/bulk-create")]
    public async Task<ActionResult<List<Task>>> BulkCreateTasks(
        [FromBody] BulkTaskCreateRequest request)
    {
        try
        {
            // I'm validating that there are tasks to create
            if (request.Tasks == null || request.Tasks.Count == 0)
            {
                return BadRequest(new { error = "No tasks provided" });
            }
            
            // I'm getting the current user's ID from the JWT token claims
            // This tells me who is creating these tasks
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                // I'm returning 401 Unauthorized if the user isn't authenticated
                return Unauthorized(new { error = "User not authenticated" });
            }
            
            var userId = int.Parse(userIdClaim.Value);
            
            // I'm calling the bulk repository to create all the tasks at once
            // This uses a database transaction for consistency
            var createdTasks = await taskBulkRepo.BulkCreateAsync(
                request.Tasks,
                request.ProjectId,
                userId
            );
            
            // I'm returning a 201 Created with the newly created tasks
            // The tasks now have database IDs and can be used in the app
            return CreatedAtAction(
                nameof(BulkCreateTasks),  // I'm using nameof for refactoring safety
                new { count = createdTasks.Count },
                createdTasks
            );
        }
        catch (Exception ex)
        {
            // I'm logging the error for debugging
            Console.Error.WriteLine($"Bulk task creation error: {ex.Message}");
            
            // I'm returning a 500 Internal Server Error
            return StatusCode(500, new 
            { 
                error = "Failed to create tasks. Please try again.",
                details = ex.Message
            });
        }
    }
    
    // I could add more AI endpoints in the future, like:
    // - POST /ai/refine-task - to improve a single task description
    // - POST /ai/suggest-assignee - to get AI recommendations for who should do a task
    // - POST /ai/estimate-hours - to get better time estimates
    // - POST /ai/detect-dependencies - to find relationships between tasks
}
