// I created this interface for bulk task operations
// This is separate from the regular task repository because bulk operations
// need special optimization and transaction handling

namespace TasclyBackend.API.Repositories;

using TasclyBackend.API.Models;

public interface ITaskBulkRepository
{
    // I created this method to create multiple tasks in a single database transaction
    // This is much more efficient than creating tasks one at a time
    // I'm using async Task because database operations are I/O bound
    Task<List<Task>> BulkCreateAsync(
        List<DraftTask> draftTasks,  // The draft tasks from the AI (or user-edited)
        int projectId,               // Which project these tasks belong to
        int createdById              // Who is creating these tasks
    );
    
    // I might add more bulk operations in the future, like:
    // - Task<int> BulkUpdateStatusAsync(List<int> taskIds, TaskStatus newStatus)
    // - Task<int> BulkDeleteAsync(List<int> taskIds)
    // - Task<int> BulkAssignAsync(List<int> taskIds, int assigneeId)
}
