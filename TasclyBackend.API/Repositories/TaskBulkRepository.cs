// I created this repository to handle bulk task creation efficiently
// I'm using .NET 9's primary constructor to inject the database context
// This is optimized for performance when creating many tasks at once

namespace TasclyBackend.API.Repositories;

using Microsoft.EntityFrameworkCore;
using TasclyBackend.API.Data;
using TasclyBackend.API.Models;

// I'm using a primary constructor here - the ApplicationDbContext becomes a private field
public class TaskBulkRepository(ApplicationDbContext context) : ITaskBulkRepository
{
    // I implemented this method to create multiple tasks in one database transaction
    // This is much faster than individual inserts and ensures all-or-nothing behavior
    public async Task<List<Task>> BulkCreateAsync(
        List<DraftTask> draftTasks, 
        int projectId, 
        int createdById)
    {
        // I'm starting a database transaction to ensure data consistency
        // If any task fails to create, all of them will be rolled back
        using var transaction = await context.Database.BeginTransactionAsync();
        
        try
        {
            // I'm pre-loading team members to enable synchronous lookup
            // Using Lookups instead of Dictionaries to handle potential duplicate names gracefully
            var allMembers = await context.TeamMembers
                .Where(tm => tm.ProjectId == projectId)
                .ToListAsync();

            var teamMembersByName = allMembers.ToLookup(m => m.Name.ToLower());
            var teamMembersByEmailPrefix = allMembers.ToLookup(m => m.Email.Split('@')[0].ToLower());

            // I'm converting the draft tasks into actual Task entities
            var tasks = new List<TaskModel>();
            
            foreach (var draft in draftTasks)
            {
                // I'm attempting to resolve the assignee ID
                int? assignedToId = null;
                if (!string.IsNullOrWhiteSpace(draft.SuggestedAssignee))
                {
                    var searchName = draft.SuggestedAssignee.ToLower();
                    // Resolve taking the first match if multiple exist
                    var match = teamMembersByName[searchName].FirstOrDefault() 
                              ?? teamMembersByEmailPrefix[searchName].FirstOrDefault();
                    
                    if (match != null)
                    {
                        assignedToId = match.Id;
                    }
                }

                tasks.Add(new TaskModel
                {
                    Title = draft.Title,
                    Description = draft.Description,
                    Priority = Enum.TryParse<TaskPriority>(draft.Priority, true, out var p) ? p : TaskPriority.Medium,
                    EstimatedHours = draft.EstimatedHours,
                    Type = Enum.TryParse<TaskType>(draft.Type, true, out var t) ? t : TaskType.Feature,
                    Status = TaskStatus.Backlog,
                    ProjectId = projectId,
                    CreatedById = createdById,
                    CreatedAt = DateTime.UtcNow,
                    AssignedToId = assignedToId,
                    ScheduledStart = draft.ScheduledStart,
                    ScheduledEnd = draft.ScheduledStart?.AddHours((double)draft.EstimatedHours),
                    DueDate = draft.DueDate
                });
            }
            
            // I'm using AddRangeAsync for better performance than adding one at a time
            // This generates a single INSERT statement with multiple rows
            await context.Tasks.AddRangeAsync(tasks);
            
            // I'm saving all the changes to the database
            await context.SaveChangesAsync();
            
            // I'm committing the transaction since everything succeeded
            await transaction.CommitAsync();
            
            // I'm returning the created tasks with their new database IDs
            return tasks;
        }
        catch (Exception ex)
        {
            // I'm rolling back the transaction if anything went wrong
            // This ensures the database stays in a consistent state
            await transaction.RollbackAsync();
            
            // I'm logging the error for debugging
            Console.Error.WriteLine($"Bulk task creation failed: {ex.Message}");
            
            // I'm re-throwing the exception so the controller can handle it
            throw;
        }
    }
    
    // I implemented this helper method to look up team members by name
    // This allows the AI to assign tasks using natural language names like "Mary"
    private async Task<int?> ResolveAssigneeId(string? suggestedAssignee, int projectId)
    {
        if (string.IsNullOrWhiteSpace(suggestedAssignee))
        {
            return null;
        }
        
        // I'm searching for a team member with a matching name (case-insensitive)
        // I'm using ToLower() to ensure "Mary" matches "mary" or "MARY"
        var teamMember = await context.TeamMembers
            .FirstOrDefaultAsync(tm => 
                tm.Name.ToLower() == suggestedAssignee.ToLower() && 
                tm.ProjectId == projectId);
                
        return teamMember?.UserId;
    }
}
