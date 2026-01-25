using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TasclyBackend.API.Models.DTOs;
using TasclyBackend.API.Services;

namespace TasclyBackend.API.Controllers;

// This controller handles project operations
// [Authorize] means ALL endpoints in this controller require a valid JWT token
// Users must be logged in to access any of these endpoints
[ApiController]
[Route("api/[controller]")]
[Authorize] // This is the key security feature!
public class ProjectsController(IProjectService projectService) : ControllerBase
{
    // Using primary constructor to inject IProjectService
    
    // GET /api/projects
    // Get all projects for the currently logged-in user
    [HttpGet]
    public async Task<IActionResult> GetMyProjects()
    {
        // Get the user ID from the JWT token claims
        // The [Authorize] attribute ensures this claim exists
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        if (userIdClaim == null)
        {
            return Unauthorized(new { message = "User ID not found in token" });
        }
        
        var userId = int.Parse(userIdClaim);
        
        // Get the user's projects from the service
        var projects = await projectService.GetUserProjectsAsync(userId);
        
        return Ok(projects);
    }
    
    // POST /api/projects
    // Create a new project for the logged-in user
    [HttpPost]
    public async Task<IActionResult> CreateProject([FromBody] CreateProjectDto createProjectDto)
    {
        // Get the user ID from the JWT token
        // This is important: I'm NOT trusting the frontend to send the user ID
        // I'm getting it from the JWT token which can't be faked
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        if (userIdClaim == null)
        {
            return Unauthorized(new { message = "User ID not found in token" });
        }
        
        var userId = int.Parse(userIdClaim);
        
        // Create the project with the authenticated user as the owner
        var project = await projectService.CreateProjectAsync(userId, createProjectDto);
        
        // Return 201 Created with the new project
        // CreatedAtAction returns the location of the new resource
        return CreatedAtAction(nameof(GetMyProjects), new { id = project.Id }, project);
    }
}
