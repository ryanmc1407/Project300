// I created this model to define the structure of draft tasks that the AI generates
// These are temporary tasks that haven't been saved to the database yet
// I'm using this interface to ensure type safety throughout my AI task generation workflow

export interface DraftTask {
    // I'm using a temporary ID to track draft tasks before they're saved
    // This helps me manage them in the UI while the user is reviewing them
    tempId: number;

    // The AI will generate these core task properties
    title: string;
    description: string;

    // I'm using string literals here to match the backend enum values
    // This makes it easier to work with select dropdowns in the UI
    priority: 'High' | 'Medium' | 'Low';

    // I want to track how long the AI thinks each task will take
    estimatedHours: number;

    // The AI will suggest who should work on this based on team member skills
    // I made this optional because not all tasks need immediate assignment
    suggestedAssignee?: string;

    // I'm categorizing tasks so they can be filtered and organized properly
    type: 'Feature' | 'Bug' | 'Improvement';
}

// I created this interface to structure the request I send to the AI backend
// This ensures I'm sending all the necessary context for task generation
export interface AiTaskRequest {
    // The natural language input from the manager
    // This could be from typing or voice input
    prompt: string;

    // I need to know which project these tasks belong to
    // This helps the AI understand the project context
    projectId: number;

    // I'm tracking who requested the AI generation
    // This is useful for audit trails and permissions
    userId: number;

    // I'm sending the current mode (Business/Project) to the backend
    // This helps the AI generate context-appropriate tasks
    mode: string;
}

// I created this interface for when the user confirms the draft tasks
// This is what I send to the backend to actually create the tasks in the database
export interface BulkTaskCreateRequest {
    // The list of tasks the user has approved (possibly edited)
    tasks: DraftTask[];

    // Which project these tasks should be created in
    projectId: number;
}

// I'm defining the response structure from the AI
// This helps me handle the data consistently
export interface AiTaskResponse {
    // The AI returns an array of draft tasks
    tasks: DraftTask[];

    // I might want to show how confident the AI is in its suggestions
    confidence?: number;

    // Any warnings or notes from the AI that I should show the user
    notes?: string;
}
