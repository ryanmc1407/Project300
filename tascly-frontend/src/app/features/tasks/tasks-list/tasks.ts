import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../../core/services/task.service';
import { Task, TaskStatus, TaskPriority } from '../../../models/task.model';

// Tasks Component
// Displays all tasks with filtering, sorting, and bulk actions
@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tasks.html',
  styleUrl: './tasks.css'
})
export class TasksComponent implements OnInit {
  private taskService = inject(TaskService);

  // All tasks
  allTasks: Task[] = [];
  filteredTasks = signal<Task[]>([]);

  // Filter options using signals
  selectedStatus = signal<string>('all');
  selectedPriority = signal<string>('all');
  searchQuery = signal<string>('');

  // View mode
  viewMode = signal<'list' | 'kanban'>('list');

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    // Mock data
    this.allTasks = [
      {
        id: 1,
        title: 'Design system updates',
        description: 'Update component library with new design tokens',
        priority: TaskPriority.High,
        type: 'Feature' as any,
        status: TaskStatus.InProgress,
        dueDate: new Date('2026-01-26'),
        estimatedHours: 8,
        projectId: 1,
        createdById: 1,
        createdAt: new Date()
      },
      {
        id: 2,
        title: 'Fix login bug',
        description: 'Users unable to login with special characters in password',
        priority: TaskPriority.High,
        type: 'Bug' as any,
        status: TaskStatus.Todo,
        dueDate: new Date('2026-01-25'),
        estimatedHours: 3,
        projectId: 1,
        createdById: 1,
        createdAt: new Date()
      },
      {
        id: 3,
        title: 'API documentation',
        description: 'Document all REST endpoints',
        priority: TaskPriority.Medium,
        type: 'Improvement' as any,
        status: TaskStatus.Todo,
        estimatedHours: 6,
        projectId: 1,
        createdById: 1,
        createdAt: new Date()
      },
      {
        id: 4,
        title: 'Performance optimization',
        description: 'Optimize database queries',
        priority: TaskPriority.Low,
        type: 'Improvement' as any,
        status: TaskStatus.Backlog,
        estimatedHours: 12,
        projectId: 1,
        createdById: 1,
        createdAt: new Date()
      },
      {
        id: 5,
        title: 'User onboarding flow',
        description: 'Create guided tour for new users',
        priority: TaskPriority.Medium,
        type: 'Feature' as any,
        status: TaskStatus.Done,
        estimatedHours: 10,
        projectId: 1,
        createdById: 1,
        createdAt: new Date()
      }
    ];
    this.filterTasks();
  }

  filterTasks() {
    const filtered = this.allTasks.filter(task => {
      const statusMatch = this.selectedStatus() === 'all' || task.status === this.selectedStatus();
      const priorityMatch = this.selectedPriority() === 'all' || task.priority.toString() === this.selectedPriority();
      const searchMatch = !this.searchQuery() ||
        task.title.toLowerCase().includes(this.searchQuery().toLowerCase()) ||
        task.description?.toLowerCase().includes(this.searchQuery().toLowerCase());

      return statusMatch && priorityMatch && searchMatch;
    });
    this.filteredTasks.set(filtered);
  }

  getPriorityClass(priority: TaskPriority): string {
    switch (priority) {
      case TaskPriority.High: return 'high';
      case TaskPriority.Medium: return 'medium';
      case TaskPriority.Low: return 'low';
      default: return 'medium';
    }
  }

  getStatusClass(status: TaskStatus): string {
    return status.toLowerCase();
  }

  isOverdue(task: Task): boolean {
    if (!task.dueDate) return false;
    return new Date(task.dueDate) < new Date() && task.status !== TaskStatus.Done;
  }
}
