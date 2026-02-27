import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Task, PostTask } from '../interfaces/tasks/task.interface';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TaskService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl;

    tasks = signal<Task[]>([]);

    async getTasksByProject(projectId: string): Promise<Task[]> {
        const tasks = await firstValueFrom(
            this.http.get<Task[]>(`${this.apiUrl}/Tasks/Projects/${projectId}`)
        );
        this.tasks.set(tasks);
        return tasks;
    }

    async getMyTasks(): Promise<Task[]> {
        const tasks = await firstValueFrom(
            this.http.get<Task[]>(`${this.apiUrl}/Tasks`)
        );
        this.tasks.set(tasks);
        return tasks;
    }

    async getDailyTasks(date: Date): Promise<Task[]> {
        const dateStr = date.toISOString().split('T')[0];
        return await firstValueFrom(
            this.http.get<Task[]>(`${this.apiUrl}/Tasks/Daily/${dateStr}`)
        );
    }

    async getWeeklyTasks(weekStart: Date): Promise<Task[]> {
        const dateStr = weekStart.toISOString().split('T')[0];
        return await firstValueFrom(
            this.http.get<Task[]>(`${this.apiUrl}/Tasks/Weekly/${dateStr}`)
        );
    }

    async createTask(projectId: string, task: PostTask): Promise<void> {
        await firstValueFrom(
            this.http.post(`${this.apiUrl}/Tasks/Projects/${projectId}`, task)
        );
    }

    async updateTask(taskId: string, task: PostTask): Promise<void> {
        await firstValueFrom(
            this.http.put(`${this.apiUrl}/Tasks/${taskId}`, task)
        );
    }

    async deleteTask(taskId: string): Promise<void> {
        await firstValueFrom(
            this.http.delete(`${this.apiUrl}/Tasks/${taskId}`)
        );
    }

    async updateTaskStatus(taskId: string, statusId: number): Promise<void> {
        await firstValueFrom(
            this.http.patch(`${this.apiUrl}/Tasks/${taskId}/Status`, statusId)
        );
    }

    async assignTask(taskId: string, assigneeId: string | null): Promise<void> {
        await firstValueFrom(
            this.http.patch(`${this.apiUrl}/Tasks/${taskId}/Assign`, assigneeId)
        );
    }
}
