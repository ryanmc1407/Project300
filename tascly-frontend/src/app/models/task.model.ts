// Task model matching the backend Task.cs model
// This represents a task in the system with all its properties and enums

export interface Task {
    id: number;
    title: string;
    description?: string;
    priority: TaskPriority;
    type: TaskType;
    status: TaskStatus;
    dueDate?: Date;
    estimatedHours?: number;
    actualHours?: number;
    scheduledStart?: Date;
    scheduledEnd?: Date;
    projectId: number;
    assignedToId?: number;
    createdById: number;
    sprintId?: number;
    createdAt: Date;
    updatedAt?: Date;
}

// Enum for task priority levels
export enum TaskPriority {
    Low = 1,
    Medium = 2,
    High = 3
}

// Enum for task types
export enum TaskType {
    Bug = 'Bug',
    Feature = 'Feature',
    Improvement = 'Improvement'
}

// Enum for task status (matches Kanban columns)
export enum TaskStatus {
    Backlog = 'Backlog',
    Todo = 'Todo',
    InProgress = 'InProgress',
    Done = 'Done'
}
