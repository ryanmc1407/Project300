import { Component, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectService } from '../../../core/services/project.service';
import { ModeService } from '../../../core/services/mode.service';
import { TaskService } from '../../../core/services/task.service';
import { TaskPriority } from '../../../models/task.model';

@Component({
  selector: 'app-business-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './business-dashboard.html',
  styleUrl: './business-dashboard.css'
})
export class BusinessDashboardComponent implements OnInit {
  projectService = inject(ProjectService);
  modeService = inject(ModeService);
  taskService = inject(TaskService);

  // Stats
  todaysTasks = {
    total: 0,
    completed: 0,
    remaining: 0
  };

  overdueItems: any[] = [];
  highPriorityItems: any[] = [];

  teamActivity = {
    total: 34,
    updates: [
      { user: 'Maria', action: 'added meeting notes', time: '2h ago' },
      { user: 'Alex', action: 'completed weekly summary', time: '5h ago' },
      { user: 'Jordan', action: 'rescheduled client call', time: 'Yesterday' },
      { user: 'Priya', action: 'updated hiring status', time: 'Yesterday' },
      { user: 'Liam', action: 'commented on budget draft', time: '2 days ago' }
    ]
  };

  constructor() {
    effect(() => {
      const tasks = this.taskService.tasks();
      const today = new Date().toDateString();

      const todaysTasksList = tasks.filter(t =>
        (t.scheduledStart && new Date(t.scheduledStart).toDateString() === today) ||
        (t.dueDate && new Date(t.dueDate).toDateString() === today)
      );

      this.todaysTasks = {
        total: todaysTasksList.length,
        completed: todaysTasksList.filter(t => t.status === 'Done' as any).length,
        remaining: todaysTasksList.filter(t => t.status !== 'Done' as any).length
      };

      this.overdueItems = tasks
        .filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Done' as any)
        .map(t => ({
          title: t.title,
          daysOverdue: Math.floor((new Date().getTime() - new Date(t.dueDate!).getTime()) / (1000 * 60 * 60 * 24)),
          priority: String(t.priority).toLowerCase()
        }));

      this.highPriorityItems = tasks
        .filter(t => t.priority === TaskPriority.High && t.status !== 'Done' as any)
        .map(t => ({
          title: t.title,
          assignee: t.assignedTo?.name || 'Unassigned',
          due: t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'No date',
          priority: 'high'
        }));
    });
  }

  ngOnInit() {
    // Fetch projects to determine the user's role
    this.projectService.getMyProjects().subscribe(projects => {
      if (projects.length > 0) {
        const currentProject = projects[0];
        if (currentProject.userRole === 'Manager') {
          this.modeService.setUserRole('manager');
        } else {
          this.modeService.setUserRole('employee');
        }
      }
    });

    // Refresh tasks too
    this.taskService.refreshTasks();
  }
}
