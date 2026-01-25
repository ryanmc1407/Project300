import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../../core/services/task.service';
import { Task, TaskPriority } from '../../../models/task.model';

// Weekly Planner Component
// Shows tasks across a 7-day week view with workload visualization
@Component({
    selector: 'app-weekly-planner',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './weekly-planner.html',
    styleUrl: './weekly-planner.css'
})
export class WeeklyPlannerComponent implements OnInit {
    private taskService = inject(TaskService);

    // Current week start date
    weekStart = new Date();

    // Days of the week with their tasks
    weekDays: { date: Date; dayName: string; tasks: Task[]; totalHours: number }[] = [];

    // Week summary
    weekSummary = {
        totalTasks: 0,
        completedTasks: 0,
        totalHours: 0,
        capacityHours: 40
    };

    ngOnInit() {
        this.initializeWeek();
        this.loadWeeklyTasks();
    }

    // Initialize the week days
    initializeWeek() {
        // Get Monday of current week
        const today = new Date();
        const dayOfWeek = today.getDay();
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust for Sunday
        this.weekStart = new Date(today);
        this.weekStart.setDate(today.getDate() + diff);

        // Create 7 days
        this.weekDays = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(this.weekStart);
            date.setDate(this.weekStart.getDate() + i);

            this.weekDays.push({
                date,
                dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
                tasks: [],
                totalHours: 0
            });
        }
    }

    // Load weekly tasks
    loadWeeklyTasks() {
        // Mock data for now - will be replaced with real API call
        const mockTasks: Task[] = [
            {
                id: 1,
                title: 'Design system updates',
                description: 'Update component library',
                priority: TaskPriority.High,
                type: 'Feature' as any,
                status: 'InProgress' as any,
                estimatedHours: 8,
                scheduledStart: new Date(this.weekDays[0].date),
                projectId: 1,
                createdById: 1,
                createdAt: new Date()
            },
            {
                id: 2,
                title: 'API integration',
                description: 'Connect frontend to backend',
                priority: TaskPriority.High,
                type: 'Feature' as any,
                status: 'Todo' as any,
                estimatedHours: 12,
                scheduledStart: new Date(this.weekDays[1].date),
                projectId: 1,
                createdById: 1,
                createdAt: new Date()
            },
            {
                id: 3,
                title: 'Code review',
                description: 'Review team PRs',
                priority: TaskPriority.Medium,
                type: 'Improvement' as any,
                status: 'Todo' as any,
                estimatedHours: 4,
                scheduledStart: new Date(this.weekDays[2].date),
                projectId: 1,
                createdById: 1,
                createdAt: new Date()
            },
            {
                id: 4,
                title: 'Sprint planning',
                description: 'Plan next sprint',
                priority: TaskPriority.Medium,
                type: 'Feature' as any,
                status: 'Todo' as any,
                estimatedHours: 3,
                scheduledStart: new Date(this.weekDays[3].date),
                projectId: 1,
                createdById: 1,
                createdAt: new Date()
            },
            {
                id: 5,
                title: 'Bug fixes',
                description: 'Fix reported issues',
                priority: TaskPriority.High,
                type: 'Bug' as any,
                status: 'Todo' as any,
                estimatedHours: 6,
                scheduledStart: new Date(this.weekDays[4].date),
                projectId: 1,
                createdById: 1,
                createdAt: new Date()
            }
        ];

        // Distribute tasks to days
        this.distributeTasks(mockTasks);
        this.calculateSummary();
    }

    // Distribute tasks to their scheduled days
    distributeTasks(tasks: Task[]) {
        tasks.forEach(task => {
            if (task.scheduledStart) {
                const taskDate = new Date(task.scheduledStart);
                const day = this.weekDays.find(d =>
                    d.date.toDateString() === taskDate.toDateString()
                );
                if (day) {
                    day.tasks.push(task);
                    day.totalHours += task.estimatedHours || 0;
                }
            }
        });
    }

    // Calculate week summary
    calculateSummary() {
        this.weekSummary.totalTasks = this.weekDays.reduce((sum, day) => sum + day.tasks.length, 0);
        this.weekSummary.completedTasks = this.weekDays.reduce((sum, day) =>
            sum + day.tasks.filter(t => t.status === 'Done').length, 0
        );
        this.weekSummary.totalHours = this.weekDays.reduce((sum, day) => sum + day.totalHours, 0);
    }

    // Get priority class
    getPriorityClass(priority: TaskPriority): string {
        switch (priority) {
            case TaskPriority.High: return 'high';
            case TaskPriority.Medium: return 'medium';
            case TaskPriority.Low: return 'low';
            default: return 'medium';
        }
    }

    // Get workload indicator class
    getWorkloadClass(hours: number): string {
        if (hours > 10) return 'overloaded';
        if (hours > 6) return 'busy';
        return 'normal';
    }

    // Format week range
    getWeekRange(): string {
        const start = this.weekDays[0].date;
        const end = this.weekDays[6].date;
        return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }

    // Check if day is today
    isToday(date: Date): boolean {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }
}
