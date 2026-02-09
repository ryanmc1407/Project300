import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../../core/services/task.service';
import { Task, TaskStatus, TaskPriority } from '../../../models/task.model';
import { ModeService } from '../../../core/services/mode.service';

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

  private modeService = inject(ModeService);

  // All tasks
  allTasks: Task[] = [];
  filteredTasks = signal<Task[]>([]);

  // Filter options using signals
  selectedStatus = signal<string>('all');
  selectedPriority = signal<string>('all');
  searchQuery = signal<string>('');

  // View mode
  viewMode = signal<'list' | 'kanban'>('list');

  constructor() {
    // Re-filter tasks when mode changes or tasks signal updates
    effect(() => {
      this.modeService.activeMode();
      this.allTasks = this.taskService.tasks();
      this.filterTasks();
    });
  }

  ngOnInit() {
    // Handled by effect
  }

  // Load today's tasks
  loadTasks() {
    this.taskService.getAllTasks().subscribe({
      next: (tasks) => {
        this.allTasks = tasks;
        this.filterTasks();
      },
      error: (err) => console.error('Failed to load tasks:', err)
    });
  }

  filterTasks() {
    const isBusinessMode = this.modeService.isBusinessMode();

    const filtered = this.allTasks.filter(task => {
      // In Business Mode, hide technical tasks
      if (isBusinessMode) {
        if (task.type === 'Bug' as any ||
          task.title.toLowerCase().includes('design system') ||
          task.title.toLowerCase().includes('login bug') ||
          task.title.toLowerCase().includes('api') ||
          task.title.toLowerCase().includes('optimization') ||
          task.description?.toLowerCase().includes('endpoint') ||
          task.description?.toLowerCase().includes('database')) {
          return false;
        }
      } else {
        // In Project Mode, optionally hide pure admin tasks if desired?
        // For now, let's keep it simple and just filter Business Mode hard.
      }

      const statusMatch = this.selectedStatus() === 'all' || task.status === this.selectedStatus();
      const priorityMatch = this.selectedPriority() === 'all' || task.priority === this.selectedPriority();
      const searchMatch = !this.searchQuery() ||
        task.title.toLowerCase().includes(this.searchQuery().toLowerCase()) ||
        task.description?.toLowerCase().includes(this.searchQuery().toLowerCase());

      return statusMatch && priorityMatch && searchMatch;
    });
    this.filteredTasks.set(filtered);
  }

  getPriorityClass(priority: any): string {
    const p = String(priority).toLowerCase();
    if (p === 'high' || p === '3') return 'high';
    if (p === 'medium' || p === '2') return 'medium';
    if (p === 'low' || p === '1') return 'low';
    return 'medium';
  }

  getStatusClass(status: TaskStatus): string {
    return status.toLowerCase();
  }

  isOverdue(task: Task): boolean {
    if (!task.dueDate) return false;
    return new Date(task.dueDate) < new Date() && task.status !== TaskStatus.Done;
  }

  // Delete a task
  deleteTask(taskId: number) {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(taskId).subscribe({
        next: () => {
          this.loadTasks(); // Reload list
        },
        error: (err) => console.error('Failed to delete task:', err)
      });
    }
  }

  // Toggle task completion status
  toggleTaskCompletion(task: Task) {
    const newStatus = task.status === TaskStatus.Done ? TaskStatus.Todo : TaskStatus.Done;

    this.taskService.updateTaskStatus(task.id!, newStatus).subscribe({
      next: () => {
        this.loadTasks(); // Reload list
      },
      error: (err) => console.error('Failed to update task status:', err)
    });
  }
}
