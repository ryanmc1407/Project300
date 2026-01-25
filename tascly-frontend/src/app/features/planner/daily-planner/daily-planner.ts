import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../../core/services/task.service';
import { Task, TaskStatus, TaskPriority } from '../../../models/task.model';

// Daily Planner Component
// Shows tasks scheduled for today with hourly time slots
@Component({
    selector: 'app-daily-planner',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './daily-planner.html',
    styleUrl: './daily-planner.css'
})
export class DailyPlannerComponent implements OnInit {
    private taskService = inject(TaskService);

    // Current date
    today = new Date();

    // Time slots for the day (8 AM to 8 PM)
    timeSlots: { hour: number; label: string; tasks: Task[] }[] = [];

    // Unscheduled tasks for today
    unscheduledTasks: Task[] = [];

    // All tasks for today
    todaysTasks: Task[] = [];

    ngOnInit() {
        this.initializeTimeSlots();
        this.loadTodaysTasks();
    }

    // Initialize hourly time slots
    initializeTimeSlots() {
        for (let hour = 8; hour <= 20; hour++) {
            const period = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour > 12 ? hour - 12 : hour;
            this.timeSlots.push({
                hour,
                label: `${displayHour}:00 ${period}`,
                tasks: []
            });
        }
    }

    // Load today's tasks
    loadTodaysTasks() {
        // Mock data for now - will be replaced with real API call
        this.todaysTasks = [
            {
                id: 1,
                title: 'Team standup meeting',
                description: 'Daily sync with the team',
                priority: TaskPriority.Medium,
                type: 'Feature' as any,
                status: TaskStatus.InProgress,
                scheduledStart: new Date(this.today.setHours(9, 0)),
                scheduledEnd: new Date(this.today.setHours(9, 30)),
                projectId: 1,
                createdById: 1,
                createdAt: new Date()
            },
            {
                id: 2,
                title: 'Review pull requests',
                description: 'Code review for new features',
                priority: TaskPriority.High,
                type: 'Feature' as any,
                status: TaskStatus.Todo,
                scheduledStart: new Date(this.today.setHours(10, 0)),
                scheduledEnd: new Date(this.today.setHours(11, 0)),
                projectId: 1,
                createdById: 1,
                createdAt: new Date()
            },
            {
                id: 3,
                title: 'Update documentation',
                description: 'Document new API endpoints',
                priority: TaskPriority.Low,
                type: 'Improvement' as any,
                status: TaskStatus.Todo,
                projectId: 1,
                createdById: 1,
                createdAt: new Date()
            },
            {
                id: 4,
                title: 'Client presentation prep',
                description: 'Prepare slides for client demo',
                priority: TaskPriority.High,
                type: 'Feature' as any,
                status: TaskStatus.Todo,
                scheduledStart: new Date(this.today.setHours(14, 0)),
                scheduledEnd: new Date(this.today.setHours(15, 30)),
                projectId: 1,
                createdById: 1,
                createdAt: new Date()
            }
        ];

        // Distribute tasks into time slots
        this.distributeTasks();
    }

    // Distribute tasks into their scheduled time slots
    distributeTasks() {
        this.unscheduledTasks = [];

        this.todaysTasks.forEach(task => {
            if (task.scheduledStart) {
                const hour = new Date(task.scheduledStart).getHours();
                const slot = this.timeSlots.find(s => s.hour === hour);
                if (slot) {
                    slot.tasks.push(task);
                }
            } else {
                this.unscheduledTasks.push(task);
            }
        });
    }

    // Get priority class for styling
    getPriorityClass(priority: TaskPriority): string {
        switch (priority) {
            case TaskPriority.High:
                return 'high';
            case TaskPriority.Medium:
                return 'medium';
            case TaskPriority.Low:
                return 'low';
            default:
                return 'medium';
        }
    }

    // Get status class for styling
    getStatusClass(status: TaskStatus): string {
        return status.toLowerCase();
    }

    // Format date for display
    getFormattedDate(): string {
        return this.today.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}
