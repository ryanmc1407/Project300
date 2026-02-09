// I created this interface to handle database operations for team members
// This is required by the AI service to look up potential assignees

namespace TasclyBackend.API.Repositories;

using TasclyBackend.API.Models;

public interface ITeamMemberRepository
{
    // I need this method to get all members of a specific project
    // The AI uses this list to suggest who should be assigned to tasks
    System.Threading.Tasks.Task<List<TeamMember>> GetByProjectIdAsync(int projectId);
    
   
    System.Threading.Tasks.Task AddAsync(TeamMember member);
    System.Threading.Tasks.Task<TeamMember?> GetByProjectAndEmailAsync(int projectId, string email);
    System.Threading.Tasks.Task<List<TeamMember>> GetByUserIdAsync(int userId);
}
