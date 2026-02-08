using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TasclyBackend.API.Data;
using TasclyBackend.API.Models;
using TasclyBackend.API.Models.DTOs;
using TasclyBackend.API.Repositories;

namespace TasclyBackend.API.Controllers;

[ApiController]
[Route("api/team-members")]
[Authorize]
public class TeamMembersController(
    ITeamMemberRepository teamMemberRepository, 
    ApplicationDbContext context // Direct context access for User lookup - ideally use IUserRepository
    ) : ControllerBase
{
    // GET /api/team-members/project/{projectId}
    [HttpGet("project/{projectId}")]
    public async System.Threading.Tasks.Task<IActionResult> GetByProject(int projectId)
    {
        var members = await teamMemberRepository.GetByProjectIdAsync(projectId);
        return Ok(members);
    }
    
    // POST /api/team-members
    [HttpPost]
    public async System.Threading.Tasks.Task<IActionResult> AddTeamMember([FromBody] AddTeamMemberDto dto)
    {
        // 1. Verify the requester has permission (Manager) - skipped for brevity, assuming owner check
        var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        
        // 2. Validate Project - ensure current user is owner or manager
        var project = await context.Projects.FindAsync(dto.ProjectId);
        if (project == null) return NotFound("Project not found");
        
        // Simple permission check: only owner can add members for now
        if (project.OwnerId != currentUserId)
        {
            // Or check existing team member role
            var existingMember = await teamMemberRepository.GetByProjectAndEmailAsync(dto.ProjectId, User.FindFirst(ClaimTypes.Email)?.Value!);
            if (existingMember?.Role != TeamRole.Manager)
            {
                return Forbid("Only managers can add team members");
            }
        }

        // 3. Find user by email
        var userToAdd = await context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        if (userToAdd == null)
        {
            return NotFound($"User with email {dto.Email} not found. They must register first.");
        }

        // 4. Check if already a member
        var existing = await teamMemberRepository.GetByProjectAndEmailAsync(dto.ProjectId, dto.Email);
        if (existing != null)
        {
            return Conflict("User is already a member of this project");
        }

        // 5. Create TeamMember
        var newMember = new TeamMember
        {
            Name = userToAdd.Username, // Use username as initial name
            Email = userToAdd.Email,
            Role = dto.Role,
            ProjectId = dto.ProjectId,
            UserId = userToAdd.Id,
            JoinedAt = DateTime.UtcNow,
            // Set default permissions based on role
            CanAccessBusinessMode = dto.Role == TeamRole.Manager,
            CanManageTeam = dto.Role == TeamRole.Manager,
            CanDeleteTasks = dto.Role == TeamRole.Manager,
            CanEditTasks = true,
            CanViewBoard = true,
            CanAssignTasks = dto.Role == TeamRole.Manager || dto.Role == TeamRole.ProductOwner
        };

        await teamMemberRepository.AddAsync(newMember);

        // Return a simple DTO to avoid circular reference issues
        var responseDto = new
        {
            id = newMember.Id,
            name = newMember.Name,
            email = newMember.Email,
            role = newMember.Role.ToString(),
            projectId = newMember.ProjectId,
            userId = newMember.UserId
        };

        return CreatedAtAction(nameof(GetByProject), new { projectId = dto.ProjectId }, responseDto);
    }
}
