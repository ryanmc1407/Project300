import { Component, OnInit, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../../core/services/task.service';
import { Task, TaskStatus, TaskPriority, TaskType } from '../../../models/task.model';
import { ModeService } from '../../../core/services/mode.service';

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
    private modeService = inject(ModeService);

    // Current viewed date
    selectedDate = new Date();

    // Time slots for the day (8 AM to 8 PM)
    timeSlots: { hour: number; label: string; tasks: Task[] }[] = [];

    // Unscheduled tasks for today
    unscheduledTasks: Task[] = [];

    // Count of tasks scheduled for future days
    futureTasksCount = 0;

    // All tasks for today
    todaysTasks: Task[] = [];

    constructor() {
        // Reload when mode changes or tasks refresh
        effect(() => {
            this.modeService.activeMode();
            this.taskService.tasks(); // Dependency for refresh
            // We no longer call initializeTimeSlots here if we want to preserve date?
            // Actually initializeTimeSlots just resets the slots structure, doesn't change date.
            // But we must load tasks for the current selectedDate.
            this.loadTodaysTasks();
        });
    }

    ngOnInit() {
        this.initializeTimeSlots();
    }

    // Navigation Methods
    nextDay() {
        const next = new Date(this.selectedDate);
        next.setDate(this.selectedDate.getDate() + 1);
        this.selectedDate = next;
        this.loadTodaysTasks();
    }

    previousDay() {
        const prev = new Date(this.selectedDate);
        prev.setDate(this.selectedDate.getDate() - 1);
        this.selectedDate = prev;
        this.loadTodaysTasks();
    }

    goToToday() {
        this.selectedDate = new Date();
        this.loadTodaysTasks();
    }

    // Initialize hourly time slots
    initializeTimeSlots() {
        this.timeSlots = []; // Clear existing
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

    // Load tasks for selected date
    loadTodaysTasks() {
        this.initializeTimeSlots(); // Always reset slots when loading new day
        this.taskService.getTodaysTasks(this.selectedDate).subscribe({
            next: (tasks) => {
                // Show all tasks (synchronize with Dashboard)
                this.todaysTasks = tasks;

                // Distribute tasks into time slots
                this.distributeTasks();
            },
            error: (err) => console.error('Failed to load today\'s tasks:', err)
        });
    }

    // Distribute tasks into their scheduled time slots
    distributeTasks() {
        this.unscheduledTasks = [];
        this.futureTasksCount = 0;
        const selectedYear = this.selectedDate.getFullYear();
        const selectedMonth = this.selectedDate.getMonth();
        const selectedDay = this.selectedDate.getDate();

        this.todaysTasks.forEach(task => {
            const dateToUse = task.scheduledStart || task.dueDate;

            if (dateToUse) {
                const taskDate = new Date(dateToUse);
                const isSameDay = taskDate.getFullYear() === selectedYear &&
                    taskDate.getMonth() === selectedMonth &&
                    taskDate.getDate() === selectedDay;

                if (isSameDay) {
                    // It's for today!
                    if (task.scheduledStart) {
                        const hour = taskDate.getHours();
                        // Find the slot that matches this hour (8-20)
                        const slot = this.timeSlots.find(s => s.hour === hour);
                        if (slot) {
                            slot.tasks.push(task);
                            return;
                        }
                    }

                    // If it's today but no hour match (or just due), put in 8 AM slot
                    if (this.timeSlots.length > 0) {
                        this.timeSlots[0].tasks.push(task);
                    }
                } else if (taskDate > this.selectedDate) {
                    // It's for the future!
                    this.futureTasksCount++;
                } else {
                    // Overdue
                    this.unscheduledTasks.push(task);
                }
            } else {
                // Dateless
                this.unscheduledTasks.push(task);
            }
        });
    }

    // Get priority class for styling
    getPriorityClass(priority: any): string {
        const p = String(priority).toLowerCase();
        if (p === 'high' || p === '3') return 'high';
        if (p === 'medium' || p === '2') return 'medium';
        if (p === 'low' || p === '1') return 'low';
        return 'medium';
    }

    // Get status class for styling
    getStatusClass(status: TaskStatus): string {
        return status.toLowerCase();
    }

    // Format date for display
    getFormattedDate(): string {
        return this.selectedDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}
