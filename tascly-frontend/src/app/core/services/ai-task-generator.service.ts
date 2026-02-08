// I created this service to handle all the AI task generation logic
// This is where I communicate with my backend AI endpoints
// I'm using Angular 19's inject() function and signals for reactive state management

import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { DraftTask, AiTaskRequest, BulkTaskCreateRequest, AiTaskResponse } from '../../models/draft-task.model';
import { ModeService } from './mode.service';
import { TaskService } from './task.service';

@Injectable({
    providedIn: 'root' // I'm making this a singleton service available throughout my app
})
export class AiTaskGeneratorService {
    // I'm injecting the HTTP client to make API calls
    private http = inject(HttpClient);
    // I'm injecting the ModeService to get the current mode context
    private modeService = inject(ModeService);
    // Inject TaskService to refresh tasks after saving
    private taskService = inject(TaskService);

    // I'm storing my API base URL here so I can easily change it if needed
    // In production, I'd move this to an environment file
    private apiUrl = 'https://localhost:7000/api';

    // I'm using signals to expose the state to my components
    // draftTasks holds the list of generated tasks
    draftTasks = signal<DraftTask[]>([]);

    // isProcessing tracks if the AI is currently working
    isProcessing = signal<boolean>(false);

    // errorSignal holds any error messages to display
    errorSignal = signal<string | null>(null);

    // Store the current project ID for bulk task creation
    private currentProjectId = signal<number>(1); // Default to project 1

    // I implemented this method to call the backend API
    // It handles the entire lifecycle of the request: loading state, error handling, etc.
    async generateTasks(prompt: string, projectId: number, userId: number): Promise<void> {
        // I'm generating a temporary ID for tracking requests
        // This helps prevent race conditions if multiple requests are made
        const requestId = Date.now();

        // I'm setting the processing state to true so the UI can show a spinner
        this.isProcessing.set(true);
        this.errorSignal.set(null); // Clear previous errors
        this.currentProjectId.set(projectId); // Store for later use

        try {
            // I'm determining the current mode string to send to the backend
            const currentMode = this.modeService.isBusinessMode() ? 'Business' : 'Project';

            // I'm making the HTTP POST request to my backend controller
            // I'm using firstValueFrom to convert the Observable to a Promise for cleaner async/await
            const response = await firstValueFrom(
                this.http.post<AiTaskResponse>(`${this.apiUrl}/ai/generate-tasks`, {
                    prompt,
                    projectId,
                    userId,
                    mode: currentMode // Sending the mode context
                })
            );

            // I'm adding temporary IDs to each task so I can track them in the UI
            // The backend doesn't need these, but they help me manage the draft state
            const tasksWithTempIds = response.tasks.map((task, index) => ({
                ...task,
                tempId: Date.now() + index // I'm using timestamp + index to ensure uniqueness
            }));

            // I'm updating the signal with the new draft tasks
            // This will automatically trigger UI updates wherever this signal is used
            this.draftTasks.set(tasksWithTempIds);

        } catch (error: any) {
            // I'm catching any errors that occur during the API call
            console.error('AI task generation failed:', error);

            // I'm setting a user-friendly error message
            // I check if the error has a message property, otherwise I use a generic message
            this.errorSignal.set(
                error?.error?.message ||
                'Failed to generate tasks. Please try again.'
            );

            // I'm clearing the draft tasks on error so the UI doesn't show stale data
            this.draftTasks.set([]);

        } finally {
            // I'm always setting processing to false, whether the request succeeded or failed
            // This ensures the loading spinner stops in all cases
            this.isProcessing.set(false);
        }
    }

    // I created this method to send the approved tasks to the backend for creation
    // This is called when the user clicks "Accept All" or "Accept Selected"
    async confirmTasks(tasks: DraftTask[], projectId: number): Promise<boolean> {
        try {
            // I'm creating the bulk create request with the approved tasks
            const request: BulkTaskCreateRequest = {
                tasks,
                projectId
            };

            // I'm sending the tasks to the backend to be saved in the database
            await firstValueFrom(
                this.http.post(`${this.apiUrl}/tasks/bulk-create`, request)
            );

            // I'm clearing the draft tasks since they've been successfully created
            this.draftTasks.set([]);

            // I'm returning true to indicate success
            return true;

        } catch (error: any) {
            console.error('Failed to create tasks:', error);

            // I'm setting an error message so the UI can show what went wrong
            this.errorSignal.set(
                error?.error?.message ||
                'Failed to create tasks. Please try again.'
            );

            // I'm returning false to indicate failure
            return false;
        }
    }

    // I created this method to update a specific field of a draft task
    // This is called when the user edits a task in the draft list
    updateDraftTask(tempId: number, field: keyof DraftTask, value: any): void {
        // I'm getting the current array of draft tasks
        const currentTasks = this.draftTasks();

        // I'm mapping over the tasks and updating the one that matches the tempId
        // I'm using the spread operator to create a new object (immutability)
        const updatedTasks = currentTasks.map(task =>
            task.tempId === tempId
                ? { ...task, [field]: value } // I'm updating just the specified field
                : task // I'm keeping other tasks unchanged
        );

        // I'm updating the signal with the modified array
        this.draftTasks.set(updatedTasks);
    }

    // I created this method to remove a draft task that the user doesn't want
    // This is called when the user clicks the delete button on a draft task
    removeDraftTask(tempId: number): void {
        // I'm filtering out the task with the matching tempId
        const updatedTasks = this.draftTasks().filter(
            task => task.tempId !== tempId
        );

        // I'm updating the signal with the filtered array
        this.draftTasks.set(updatedTasks);
    }

    // I created this method to clear all draft tasks
    // This is useful when the user wants to start over or cancel the generation
    clearDraftTasks(): void {
        this.draftTasks.set([]);
        this.errorSignal.set(null);
    }

    // I created this method to get the current count of draft tasks
    // This is a convenience method for the UI to show task counts
    getDraftTaskCount(): number {
        return this.draftTasks().length;
    }

    // Save all draft tasks to the backend
    async saveDraftTasks(): Promise<boolean> {
        const tasks = this.draftTasks();
        if (tasks.length === 0) {
            return false;
        }

        this.isProcessing.set(true);
        this.errorSignal.set(null);

        try {
            // Call the bulk create endpoint
            const requestBody = {
                projectId: this.currentProjectId(),
                tasks: tasks.map(task => ({
                    tempId: Number(task.tempId),
                    title: task.title,
                    description: task.description,
                    priority: task.priority,
                    estimatedHours: Number(task.estimatedHours),
                    type: task.type,
                    suggestedAssignee: task.suggestedAssignee || null,
                    scheduledStart: task.scheduledStart || null,
                    dueDate: task.dueDate || null
                }))
            };

            console.log('Sending bulk request:', JSON.stringify(requestBody, null, 2));

            await firstValueFrom(
                this.http.post(`${this.apiUrl}/tasks/bulk`, requestBody)
            );

            // Refresh the main task lists
            this.taskService.refreshTasks();

            // Clear draft tasks after successful save
            this.clearDraftTasks();
            return true;
        } catch (error: any) {
            console.error('Failed to save draft tasks:', error);
            this.errorSignal.set('Failed to save tasks. Please try again.');
            return false;
        } finally {
            this.isProcessing.set(false);
        }
    }
}
