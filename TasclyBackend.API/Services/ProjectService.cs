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
        // Get all projects where the user is either the Owner OR a Team Member
        // I need to fetch the user's specific role for each project
        
        var projects = await context.Projects
            .Include(p => p.TeamMembers) // Eager load team members to find the role
            .Where(p => p.OwnerId == userId || p.TeamMembers.Any(tm => tm.UserId == userId))
            .Select(p => new ProjectDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                OwnerId = p.OwnerId,
                CreatedAt = p.CreatedAt,
                // Determine logic: Owner is Manager. 
                // If not owner, look up their role in TeamMembers list.
                // Note: EF Core translation of this inside Select can be tricky.
                // A safer way often is to pull data then map, but for simple logic:
                UserRole = p.OwnerId == userId 
                    ? "Manager" 
                    : p.TeamMembers.Where(tm => tm.UserId == userId).Select(tm => tm.Role.ToString()).FirstOrDefault() ?? "Viewer"
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
            CreatedAt = project.CreatedAt,
            UserRole = "Manager" // Creator is always the manager
        };
    }
}
