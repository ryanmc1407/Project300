using TasclyBackend.API.Models.DTOs;

namespace TasclyBackend.API.Services;

// This interface defines what my ProjectService should do
// Following the same pattern as IAuthService for consistency
public interface IProjectService
{
    // Get all projects for a specific user
    Task<List<ProjectDto>> GetUserProjectsAsync(int userId);
    
    // Create a new project for a user
    Task<ProjectDto> CreateProjectAsync(int userId, CreateProjectDto createProjectDto);
}
