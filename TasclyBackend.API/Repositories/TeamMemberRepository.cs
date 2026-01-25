// I created this repository to implement the team member data access
// I'm using Entity Framework Core to query the database

namespace TasclyBackend.API.Repositories;

using Microsoft.EntityFrameworkCore;
using TasclyBackend.API.Data;
using TasclyBackend.API.Models;

// I'm using the primary constructor to inject the DbContext
public class TeamMemberRepository(ApplicationDbContext context) : ITeamMemberRepository
{
    // I implemented this method to fetch team members for a project
    // I'm using AsNoTracking() for better performance since I only need to read the data
    public async Task<List<TeamMember>> GetByProjectIdAsync(int projectId)
    {
        return await context.TeamMembers
               .Where(tm => tm.ProjectId == projectId)
               .ToListAsync();
    }
}
