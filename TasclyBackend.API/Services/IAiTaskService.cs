// I created this interface to define the contract for AI task generation
// Using an interface allows me to easily mock this service for testing
// It also follows the Dependency Inversion Principle from SOLID

namespace TasclyBackend.API.Services;

using TasclyBackend.API.Models;

public interface IAiTaskService
{
    // I created this method to generate tasks from a natural language prompt
    // It returns a list of draft tasks that the user can review before creating
    // I'm using async Task because this will call the OpenAI API which is I/O bound
    Task<List<DraftTask>> GenerateTasksFromPrompt(
        string prompt,      // The natural language description from the manager
        int projectId,      // The project context for better AI suggestions
        string mode         // The application mode (Business vs Project)
    );
    
    // I might add more methods in the future, like:
    // - Task<DraftTask> RefineTask(string taskDescription, string feedback)
    // - Task<List<string>> SuggestImprovements(DraftTask task)
    // - Task<TeamMember> SuggestAssignee(DraftTask task, List<TeamMember> team)
}
