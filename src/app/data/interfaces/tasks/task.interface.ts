// Core domain interfaces updated for new backend (GUIDs, not numbers)

export interface Task {
    id: string;
    name: string;
    description: string;
    startDate: Date;
    dueDate: Date;
    creationDate: Date;
    completionDate?: Date;
    lastModifiedDate: Date;
    statusName: string;
    importanceName: string;
    projectId: string;
    authorId: string;
    assigneeId?: string;
}

export interface PostTask {
    name: string;
    description: string;
    startDate?: Date;
    dueDate?: Date;
    statusId: number;
    importanceId: number;
    assigneeId?: string;
}

// AI-related interfaces
export interface DraftTask {
    tempId: number;
    name: string;
    description: string;
    dueDate?: Date;
    startDate?: Date;
    importanceId: number;
    statusId: number;
    assigneeId?: string;
}

export interface AiGenerateRequest {
    prompt: string;
    projectId: string;
    mode: string;
}

export interface AiGenerateResponse {
    tasks: DraftTask[];
}

export interface BulkCreateRequest {
    tasks: DraftTask[];
    projectId: string;
}
