// I created this interface to handle database operations for team members
// This is required by the AI service to look up potential assignees

namespace TasclyBackend.API.Repositories;

using TasclyBackend.API.Models;

public interface ITeamMemberRepository
{
    // I need this method to get all members of a specific project
    // The AI uses this list to suggest who should be assigned to tasks
    Task<List<TeamMember>> GetByProjectIdAsync(int projectId);
    
    // I might add more methods later, like:
    // Task<TeamMember?> GetByIdAsync(int id);
    // Task AddAsync(TeamMember member);
}
