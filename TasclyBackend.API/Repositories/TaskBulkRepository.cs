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
            // I'm converting the draft tasks into actual Task entities
            // I need to map the string values to enums and set the database fields
            var tasks = draftTasks.Select(draft => new Task
            {
                // I'm mapping the basic properties from the draft
                Title = draft.Title,
                Description = draft.Description,
                
                // I'm parsing the priority string into the enum
                // I'm using Enum.Parse because I trust the frontend validation
                Priority = Enum.Parse<TaskPriority>(draft.Priority),
                
                EstimatedHours = draft.EstimatedHours,
                
                // I'm parsing the type string into the enum
                Type = Enum.Parse<TaskType>(draft.Type),
                
                // I'm setting all new tasks to Backlog status by default
                // The user can move them to other columns later
                Status = TaskStatus.Backlog,
                
                // I'm setting the project and creator information
                ProjectId = projectId,
                CreatedById = createdById,
                CreatedAt = DateTime.UtcNow,
                
                // I'm leaving AssignedToId null for now
                // In a future enhancement, I could look up the suggested assignee
                // and set the AssignedToId based on the team member's name
                AssignedToId = null
                
            }).ToList();
            
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
            throw new Exception("Failed to create tasks in bulk", ex);
        }
    }
    
    // I could add a helper method to resolve suggested assignees in the future
    // This would look up team members by name and set the AssignedToId
    private async Task<int?> ResolveAssigneeId(string? suggestedAssignee, int projectId)
    {
        if (string.IsNullOrEmpty(suggestedAssignee))
        {
            return null;
        }
        
        // I would query the team members table to find a match
        // For now, I'm just returning null since this is a future enhancement
        // var teamMember = await context.TeamMembers
        //     .FirstOrDefaultAsync(tm => 
        //         tm.Name == suggestedAssignee && 
        //         tm.ProjectId == projectId);
        // return teamMember?.UserId;
        
        return null;
    }
}
