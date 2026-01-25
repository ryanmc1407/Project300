using Microsoft.EntityFrameworkCore;
using TasclyBackend.API.Data;
using TasclyBackend.API.Models;
using TasclyBackend.API.Models.DTOs;

namespace TasclyBackend.API.Services;

// This service handles all project-related operations
// Using primary constructor to inject the database context
public class ProjectService(ApplicationDbContext context) : IProjectService
{
    public async Task<List<ProjectDto>> GetUserProjectsAsync(int userId)
    {
        // Get all projects where the OwnerId matches the userId
        // I'm using Select to convert from Project to ProjectDto
        // This is called "projection" - only selecting the fields I need
        var projects = await context.Projects
            .Where(p => p.OwnerId == userId)
            .Select(p => new ProjectDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                OwnerId = p.OwnerId,
                CreatedAt = p.CreatedAt
            })
            .ToListAsync();
        
        return projects;
    }
    
    public async Task<ProjectDto> CreateProjectAsync(int userId, CreateProjectDto createProjectDto)
    {
        // Create a new project and automatically set the OwnerId to the logged-in user
        // This is important for security - users can only create projects for themselves
        var project = new Project
        {
            Name = createProjectDto.Name,
            Description = createProjectDto.Description,
            OwnerId = userId, // Setting this from the JWT token, not from the request
            CreatedAt = DateTime.UtcNow
        };
        
        // Add to database and save
        context.Projects.Add(project);
        await context.SaveChangesAsync();
        
        // Return the created project as a DTO
        return new ProjectDto
        {
            Id = project.Id,
            Name = project.Name,
            Description = project.Description,
            OwnerId = project.OwnerId,
            CreatedAt = project.CreatedAt
        };
    }
}
