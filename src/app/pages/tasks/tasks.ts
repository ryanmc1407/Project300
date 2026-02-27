import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../data/services/task.service';
import { Task } from '../../data/interfaces/tasks/task.interface';

@Component({
    selector: 'app-tasks',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './tasks.html',
    styleUrl: './tasks.css'
})
export class TasksComponent implements OnInit {
    private taskService = inject(TaskService);

    allTasks: Task[] = [];
    filteredTasks = signal<Task[]>([]);
    selectedStatus = signal<string>('all');
    selectedImportance = signal<string>('all');
    searchQuery = signal<string>('');
    viewMode = signal<'list' | 'kanban'>('list');
    isLoading = signal<boolean>(false);
    error = signal<string | null>(null);

    ngOnInit() {
        this.loadTasks();
    }

    async loadTasks() {
        this.isLoading.set(true);
        try {
            this.allTasks = await this.taskService.getMyTasks();
            this.filterTasks();
        } catch (err: any) {
            this.error.set('Failed to load tasks.');
        } finally {
            this.isLoading.set(false);
        }
    }

    filterTasks() {
        const filtered = this.allTasks.filter(task => {
            const statusMatch = this.selectedStatus() === 'all' ||
                task.statusName?.toLowerCase() === this.selectedStatus();
            const importanceMatch = this.selectedImportance() === 'all' ||
                task.importanceName?.toLowerCase() === this.selectedImportance();
            const q = this.searchQuery().toLowerCase();
            const searchMatch = !q ||
                task.name.toLowerCase().includes(q) ||
                task.description?.toLowerCase().includes(q);
            return statusMatch && importanceMatch && searchMatch;
        });
        this.filteredTasks.set(filtered);
    }

    getImportanceClass(importanceName: string): string {
        return importanceName?.toLowerCase() ?? 'medium';
    }

    getStatusClass(statusName: string): string {
        return statusName?.toLowerCase().replace(' ', '-') ?? '';
    }

    isOverdue(task: Task): boolean {
        if (!task.dueDate) return false;
        return new Date(task.dueDate) < new Date() && task.statusName !== 'Done';
    }

    async deleteTask(taskId: string) {
        try {
            await this.taskService.deleteTask(taskId);
            await this.loadTasks();
        } catch {
            this.error.set('Failed to delete task.');
        }
    }

    async updateStatus(taskId: string, statusId: number) {
        try {
            await this.taskService.updateTaskStatus(taskId, statusId);
            await this.loadTasks();
        } catch {
            this.error.set('Failed to update task status.');
        }
    }
}
