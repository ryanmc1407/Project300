import { Component, OnInit, inject, signal, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../data/services/task.service';
import { ProjectsService } from '../../data/services/projects-service';
import { Task } from '../../data/interfaces/tasks/task.interface';
import { GetProject } from '../../data/interfaces/projects/get-project';
import { Router } from '@angular/router';

@Component({
    selector: 'app-project-detail',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './project-detail.html',
    styleUrl: './project-detail.css'
})
export class ProjectDetailComponent implements OnInit {
    private taskService = inject(TaskService);
    private projectsService = inject(ProjectsService);
    private router = inject(Router);

    // Route parameter
    id = input<string>();

    project = signal<GetProject | null>(null);
    tasks = signal<Task[]>([]);
    filteredTasks = signal<Task[]>([]);

    selectedStatus = signal<string>('all');
    searchQuery = signal<string>('');
    isLoading = signal<boolean>(false);
    error = signal<string | null>(null);

    ngOnInit() {
        this.loadData();
    }

    async loadData() {
        const projectId = this.id();
        if (!projectId) return;

        this.isLoading.set(true);
        try {
            // Load project info
            const projectInfo = await this.projectsService.getProjectById(projectId).toPromise();
            this.project.set(projectInfo || null);

            // Load project tasks
            const projectTasks = await this.taskService.getTasksByProject(projectId);
            this.tasks.set(projectTasks);
            this.filterTasks();
        } catch (err) {
            this.error.set('Failed to load project details.');
        } finally {
            this.isLoading.set(false);
        }
    }

    filterTasks() {
        const filtered = this.tasks().filter((task: Task) => {
            const statusMatch = this.selectedStatus() === 'all' ||
                task.statusName?.toLowerCase() === this.selectedStatus();
            const q = this.searchQuery().toLowerCase();
            const searchMatch = !q ||
                task.name.toLowerCase().includes(q) ||
                task.description?.toLowerCase().includes(q);
            return statusMatch && searchMatch;
        });
        this.filteredTasks.set(filtered);
    }

    getImportanceClass(importanceName: string): string {
        return importanceName?.toLowerCase() ?? 'medium';
    }

    getStatusClass(statusName: string): string {
        return statusName?.toLowerCase().replace(' ', '-') ?? '';
    }

    createTaskViaAi() {
        this.router.navigate(['/dashboard/ai-task-generator'], {
            queryParams: { projectId: this.id() }
        });
    }

    async deleteTask(taskId: string) {
        console.log('Attempting to delete task with ID:', taskId);
        if (confirm('Are you sure you want to delete this task?')) {
            try {
                await this.taskService.deleteTask(taskId);
                // Refresh the local list
                this.tasks.update(ts => ts.filter(t => t.id !== taskId));
                this.filterTasks();
            } catch (err) {
                alert('Failed to delete task.');
            }
        }
    }
}
