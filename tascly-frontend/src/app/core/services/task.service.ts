import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, TaskStatus, TaskPriority } from '../../models/task.model';

// Service for managing tasks
// Handles CRUD operations, filtering, and scheduling
@Injectable({
    providedIn: 'root'
})
export class TaskService {
    private apiUrl = 'https://localhost:7000/api/tasks';

    // Signal to hold the current tasks
    tasks = signal<Task[]>([]);

    constructor(private http: HttpClient) { }

    // Get all tasks
    getAllTasks(): Observable<Task[]> {
        return this.http.get<Task[]>(this.apiUrl);
    }

    // Get task by ID
    getTaskById(id: number): Observable<Task> {
        return this.http.get<Task>(`${this.apiUrl}/${id}`);
    }

    // Get tasks for today (scheduled for today)
    getTodaysTasks(): Observable<Task[]> {
        const today = new Date().toISOString().split('T')[0];
        return this.http.get<Task[]>(`${this.apiUrl}/daily/${today}`);
    }

    // Get tasks for a specific week
    getWeeklyTasks(startDate: Date): Observable<Task[]> {
        const dateStr = startDate.toISOString().split('T')[0];
        return this.http.get<Task[]>(`${this.apiUrl}/weekly/${dateStr}`);
    }

    // Get tasks by status
    getTasksByStatus(status: TaskStatus): Observable<Task[]> {
        return this.http.get<Task[]>(`${this.apiUrl}/status/${status}`);
    }

    // Get tasks by priority
    getTasksByPriority(priority: TaskPriority): Observable<Task[]> {
        return this.http.get<Task[]>(`${this.apiUrl}/priority/${priority}`);
    }

    // Get overdue tasks
    getOverdueTasks(): Observable<Task[]> {
        return this.http.get<Task[]>(`${this.apiUrl}/overdue`);
    }

    // Create a new task
    createTask(task: Partial<Task>): Observable<Task> {
        return this.http.post<Task>(this.apiUrl, task);
    }

    // Update an existing task
    updateTask(id: number, task: Partial<Task>): Observable<Task> {
        return this.http.put<Task>(`${this.apiUrl}/${id}`, task);
    }

    // Delete a task
    deleteTask(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    // Schedule a task for a specific time
    scheduleTask(id: number, start: Date, end: Date): Observable<Task> {
        return this.http.patch<Task>(`${this.apiUrl}/${id}/schedule`, {
            scheduledStart: start,
            scheduledEnd: end
        });
    }

    // Update task status
    updateTaskStatus(id: number, status: TaskStatus): Observable<Task> {
        return this.http.patch<Task>(`${this.apiUrl}/${id}/status`, { status });
    }

    // Assign task to team member
    assignTask(id: number, teamMemberId: number): Observable<Task> {
        return this.http.patch<Task>(`${this.apiUrl}/${id}/assign`, { assignedToId: teamMemberId });
    }
}
