using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TasclyBackend.API.Data;
using TasclyBackend.API.Repositories;
using TasclyBackend.API.Models;
using TaskModel = TasclyBackend.API.Models.Task; // Use TaskModel to avoid conflict with System.Threading.Tasks.Task

namespace TasclyBackend.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TasksController(ApplicationDbContext context, ITaskBulkRepository taskBulkRepository) : ControllerBase
{
    // GET: api/tasks
    // Get all tasks assigned to the current user
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TaskModel>>> GetMyTasks()
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdString)) return Unauthorized();
        var userId = int.Parse(userIdString);

        // I'm filtering by the UserId of the team member assigned to the task
        // Also showing tasks created by the user
        return await context.Tasks
            .Where(t => t.AssignedTo != null && t.AssignedTo.UserId == userId || t.CreatedById == userId)
            .Include(t => t.Project)
            .Include(t => t.AssignedTo)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
    }
    
    // GET: api/tasks/daily/{date}
    [HttpGet("daily/{date}")]
    public async Task<ActionResult<IEnumerable<TaskModel>>> GetDailyTasks(DateTime date)
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdString)) return Unauthorized();
        var userId = int.Parse(userIdString);

        var startOfDay = date.Date;
        var endOfDay = startOfDay.AddDays(1);

        // Get IDs of projects where the user is a Manager or Owner
        var managedProjectIds = await context.Projects
            .Where(p => p.OwnerId == userId || p.TeamMembers.Any(tm => tm.UserId == userId && tm.Role == TeamRole.Manager))
            .Select(p => p.Id)
            .ToListAsync();

        return await context.Tasks
            .Where(t => 
                (t.AssignedTo != null && t.AssignedTo.UserId == userId) || // Assigned to me
                (t.CreatedById == userId) || // Created by me
                (managedProjectIds.Contains(t.ProjectId)) // In a project I manage
            )
            .Where(t => 
                (t.ScheduledStart >= startOfDay && t.ScheduledStart < endOfDay) || // Scheduled for today
                (t.DueDate >= startOfDay && t.DueDate < endOfDay) || // Due today
                (t.Status != TasclyBackend.API.Models.TaskStatus.Done) // Include any open task (backlog)
            )
            .Include(t => t.Project)
            .Include(t => t.AssignedTo)
            .OrderBy(t => t.ScheduledStart ?? (t.DueDate ?? DateTime.MaxValue))
            .ToListAsync();
    }

    // GET: api/tasks/weekly/{date}
    [HttpGet("weekly/{date}")]
    public async Task<ActionResult<IEnumerable<TaskModel>>> GetWeeklyTasks(DateTime date)
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdString)) return Unauthorized();
        var userId = int.Parse(userIdString);

        var startOfWeek = date.Date;
        var endOfWeek = startOfWeek.AddDays(7);

        // Get IDs of projects where the user is a Manager or Owner
        var managedProjectIds = await context.Projects
            .Where(p => p.OwnerId == userId || p.TeamMembers.Any(tm => tm.UserId == userId && tm.Role == TeamRole.Manager))
            .Select(p => p.Id)
            .ToListAsync();

        return await context.Tasks
            .Where(t => 
                (t.AssignedTo != null && t.AssignedTo.UserId == userId) || 
                (t.CreatedById == userId) ||
                (managedProjectIds.Contains(t.ProjectId))
            )
            .Where(t => 
                (t.ScheduledStart >= startOfWeek && t.ScheduledStart < endOfWeek) || 
                (t.DueDate >= startOfWeek && t.DueDate < endOfWeek) ||
                (t.Status != TasclyBackend.API.Models.TaskStatus.Done) // Include any open task (backlog)
            )
            .Include(t => t.Project)
            .Include(t => t.AssignedTo)
            .OrderBy(t => t.ScheduledStart ?? (t.DueDate ?? DateTime.MaxValue))
            .ToListAsync();
    }
    
    // GET: api/tasks/project/{projectId}
    // Get all tasks for a specific project
    [HttpGet("project/{projectId}")]
    public async Task<ActionResult<IEnumerable<TaskModel>>> GetProjectTasks(int projectId)
    {
        // Security check: Ensure user is a member of the project
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdString)) return Unauthorized();
        var userId = int.Parse(userIdString);
        
        var isMember = await context.TeamMembers
            .AnyAsync(tm => tm.ProjectId == projectId && tm.UserId == userId);
            
        // We also allow the owner to see tasks
        var isOwner = await context.Projects
            .AnyAsync(p => p.Id == projectId && p.OwnerId == userId);
            
        if (!isMember && !isOwner)
        {
            return Forbid();
        }

        return await context.Tasks
            .Where(t => t.ProjectId == projectId)
            .Include(t => t.AssignedTo)
            .Include(t => t.Project)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
    }

    // POST: api/tasks/bulk
    // Create multiple tasks at once (for AI-generated tasks)
    [HttpPost("bulk")]
    public async Task<ActionResult> BulkCreateTasks([FromBody] BulkTaskCreateRequest request)
    {
        // Debug logging
        Console.WriteLine($"Bulk create request received. ProjectId: {request?.ProjectId}, Tasks count: {request?.Tasks?.Count}");

        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdString)) return Unauthorized();
        var userId = int.Parse(userIdString);

        // Validate that user has permission to create tasks in this project
        var isOwner = await context.Projects
            .AnyAsync(p => p.Id == request!.ProjectId && p.OwnerId == userId);

        var isManager = await context.TeamMembers
            .AnyAsync(tm => tm.ProjectId == request!.ProjectId && 
                           tm.UserId == userId && 
                           tm.Role == TeamRole.Manager);

        if (!isOwner && !isManager)
        {
            return Forbid();
        }

        // Use the bulk repository to create all tasks efficiently
        await taskBulkRepository.BulkCreateAsync(
            request!.Tasks,
            request.ProjectId,
            userId
        );

        // Return 204 No Content to avoid circular reference serialization issues
        // The frontend doesn't need the created tasks, it just needs to know they were created
        return NoContent();
    }

    // PATCH: api/tasks/{id}/schedule
    // Update task scheduled dates (for drag-and-drop)
    [HttpPatch("{id}/schedule")]
    public async Task<ActionResult<TaskModel>> UpdateTaskSchedule(int id, [FromBody] ScheduleUpdateDto scheduleDto)
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdString)) return Unauthorized();
        var userId = int.Parse(userIdString);

        // Find the task
        var task = await context.Tasks
            .Include(t => t.Project)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (task == null) return NotFound();

        // Check permissions - must be owner, manager, or assigned to the task
        var isOwner = task.Project.OwnerId == userId;
        var isManager = await context.TeamMembers
            .AnyAsync(tm => tm.ProjectId == task.ProjectId && 
                           tm.UserId == userId && 
                           tm.Role == TeamRole.Manager);
        var isAssigned = task.AssignedToId != null && 
                        await context.TeamMembers
                            .AnyAsync(tm => tm.Id == task.AssignedToId && tm.UserId == userId);

        if (!isOwner && !isManager && !isAssigned)
        {
            return Forbid();
        }

        // Update the schedule
        task.ScheduledStart = scheduleDto.ScheduledStart;
        task.ScheduledEnd = scheduleDto.ScheduledEnd;

        await context.SaveChangesAsync();

        return Ok(task);
    }

    // PATCH: api/tasks/{id}/status
    [HttpPatch("{id}/status")]
    public async Task<ActionResult<TaskModel>> UpdateTaskStatus(int id, [FromBody] StatusUpdateDto statusDto)
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdString)) return Unauthorized();
        var userId = int.Parse(userIdString);

        var task = await context.Tasks
            .Include(t => t.Project)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (task == null) return NotFound();

        // Check permissions - must be owner, manager, or assigned to the task
        var isOwner = task.Project.OwnerId == userId;
        var isManager = await context.TeamMembers
            .AnyAsync(tm => tm.ProjectId == task.ProjectId && 
                           tm.UserId == userId && 
                           tm.Role == TeamRole.Manager);
        var isAssigned = task.AssignedToId != null && 
                        await context.TeamMembers
                            .AnyAsync(tm => tm.Id == task.AssignedToId && tm.UserId == userId);

        if (!isOwner && !isManager && !isAssigned)
        {
            return Forbid();
        }

        task.Status = statusDto.Status;
        await context.SaveChangesAsync();

        return Ok(task);
    }

    // DELETE: api/tasks/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTask(int id)
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdString)) return Unauthorized();
        var userId = int.Parse(userIdString);

        var task = await context.Tasks
            .Include(t => t.Project)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (task == null) return NotFound();

        // Check permissions - only Owner and Manager can delete
        var isOwner = task.Project.OwnerId == userId;
        var isManager = await context.TeamMembers
            .AnyAsync(tm => tm.ProjectId == task.ProjectId && 
                           tm.UserId == userId && 
                           tm.Role == TeamRole.Manager);

        if (!isOwner && !isManager)
        {
            return Forbid();
        }

        context.Tasks.Remove(task);
        await context.SaveChangesAsync();

        return NoContent();
    }
}

// DTO for schedule updates
public record ScheduleUpdateDto(DateTime? ScheduledStart, DateTime? ScheduledEnd);
public record StatusUpdateDto(TasclyBackend.API.Models.TaskStatus Status);
