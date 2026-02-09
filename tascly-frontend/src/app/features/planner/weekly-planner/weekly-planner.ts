import { Component, OnInit, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, moveItemInArray, transferArrayItem, DragDropModule } from '@angular/cdk/drag-drop';
import { TaskService } from '../../../core/services/task.service';
import { Task, TaskPriority, TaskType, TaskStatus } from '../../../models/task.model';
import { ModeService } from '../../../core/services/mode.service';

// Weekly Planner Component
// Shows tasks across a 7-day week view with workload visualization
@Component({
    selector: 'app-weekly-planner',
    standalone: true,
    imports: [CommonModule, DragDropModule],
    templateUrl: './weekly-planner.html',
    styleUrl: './weekly-planner.css'
})
export class WeeklyPlannerComponent implements OnInit {
    private taskService = inject(TaskService);
    private modeService = inject(ModeService);

    // Current week start date
    weekStart = new Date();

    // Days of the week with their tasks
    weekDays: { date: Date; dayName: string; tasks: Task[]; totalHours: number }[] = [];
    unscheduledTasks: Task[] = [];
    futureTasksCount = 0;

    // Week summary
    weekSummary = {
        totalTasks: 0,
        completedTasks: 0,
        totalHours: 0,
        capacityHours: 40
    };

    constructor() {
        // Reload tasks when mode changes or tasks refresh
        effect(() => {
            this.modeService.activeMode();
            this.taskService.tasks(); // Dependency for refresh
            // We no longer call initializeWeek here to prevent jumping back to current week
            this.loadWeeklyTasks();
        });
    }

    ngOnInit() {
        this.initializeWeek();
    }

    // Initialize the week days
    initializeWeek(baseDate: Date = new Date()) {
        // Get Monday of the week for the baseDate
        const dayOfWeek = baseDate.getDay();
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust for Sunday
        this.weekStart = new Date(baseDate);
        this.weekStart.setDate(baseDate.getDate() + diff);
        this.weekStart.setHours(0, 0, 0, 0);

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

    // Navigation Methods
    nextWeek() {
        const next = new Date(this.weekStart);
        next.setDate(this.weekStart.getDate() + 7);
        this.initializeWeek(next);
        this.loadWeeklyTasks();
    }

    previousWeek() {
        const prev = new Date(this.weekStart);
        prev.setDate(this.weekStart.getDate() - 7);
        this.initializeWeek(prev);
        this.loadWeeklyTasks();
    }

    goToToday() {
        this.initializeWeek(new Date());
        this.loadWeeklyTasks();
    }

    // Load weekly tasks
    loadWeeklyTasks() {
        this.taskService.getWeeklyTasks(this.weekStart).subscribe({
            next: (tasks) => {
                // Show all tasks (synchronize with Dashboard)
                const allTasks = tasks;

                // Reset day tasks before distributing
                this.weekDays.forEach(d => {
                    d.tasks = [];
                    d.totalHours = 0;
                });

                // Distribute tasks to days
                this.distributeTasks(allTasks);
                this.calculateSummary();
            },
            error: (err) => console.error('Failed to load weekly tasks:', err)
        });
    }

    // Distribute tasks to their scheduled days or due dates
    distributeTasks(tasks: Task[]) {
        this.unscheduledTasks = [];
        this.futureTasksCount = 0;

        tasks.forEach(task => {
            const dateToUse = task.scheduledStart || task.dueDate;

            if (dateToUse) {
                const taskDate = new Date(dateToUse);
                const taskYear = taskDate.getFullYear();
                const taskMonth = taskDate.getMonth();
                const taskDay = taskDate.getDate();

                // Find the specific day in our weekDays array
                const day = this.weekDays.find(d =>
                    d.date.getFullYear() === taskYear &&
                    d.date.getMonth() === taskMonth &&
                    d.date.getDate() === taskDay
                );

                if (day) {
                    day.tasks.push(task);
                    day.totalHours += task.estimatedHours || 0;
                } else if (taskDate > this.weekDays[6].date) {
                    // It's in a future week
                    this.futureTasksCount++;
                } else if (taskDate < this.weekStart) {
                    // Overdue
                    this.unscheduledTasks.push(task);
                }
            } else {
                // Completely unscheduled
                this.unscheduledTasks.push(task);
            }
        });
    }

    // Calculate week summary
    calculateSummary() {
        this.weekSummary.totalTasks = this.weekDays.reduce((sum, day) => sum + day.tasks.length, 0) + this.unscheduledTasks.length;
        this.weekSummary.completedTasks = this.weekDays.reduce((sum, day) =>
            sum + day.tasks.filter(t => t.status === 'Done').length, 0
        ) + this.unscheduledTasks.filter(t => t.status === 'Done').length;
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

    // Handle task drop event
    onTaskDrop(event: CdkDragDrop<Task[]>, targetDay?: { date: Date; tasks: Task[] }) {
        const task = event.item.data as Task;

        if (event.previousContainer === event.container) {
            // Reordering within the same day
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            // Moving between different containers
            transferArrayItem(
                event.previousContainer.data,
                event.container.data,
                event.previousIndex,
                event.currentIndex
            );

            // Update task schedule if dropped on a day
            if (targetDay && task.id) {
                const newScheduledStart = new Date(targetDay.date);
                newScheduledStart.setHours(9, 0, 0, 0); // Default to 9 AM

                const newScheduledEnd = new Date(targetDay.date);
                newScheduledEnd.setHours(17, 0, 0, 0); // Default to 5 PM

                // Call backend to update the task
                this.taskService.scheduleTask(task.id, newScheduledStart, newScheduledEnd).subscribe({
                    next: () => {
                        console.log('Task scheduled successfully');
                        this.calculateSummary();
                    },
                    error: (err) => {
                        console.error('Failed to schedule task:', err);
                        // Revert the UI change on error
                        transferArrayItem(
                            event.container.data,
                            event.previousContainer.data,
                            event.currentIndex,
                            event.previousIndex
                        );
                    }
                });
            } else {
                // Dropped back to unscheduled - clear the schedule
                if (task.id) {
                    // We could add a method to clear schedule, for now just recalculate
                    this.calculateSummary();
                }
            }
        }
    }

    // Delete a task
    deleteTask(event: Event, taskId: number) {
        event.stopPropagation(); // Prevent opening task details
        if (confirm('Are you sure you want to delete this task?')) {
            this.taskService.deleteTask(taskId).subscribe({
                next: () => {
                    this.loadWeeklyTasks();
                },
                error: (err) => console.error('Failed to delete task:', err)
            });
        }
    }

    // Toggle task completion status
    toggleTaskCompletion(event: Event, task: Task) {
        event.stopPropagation();
        const newStatus = task.status === TaskStatus.Done ? TaskStatus.Todo : TaskStatus.Done;

        this.taskService.updateTaskStatus(task.id!, newStatus).subscribe({
            next: () => {
                this.loadWeeklyTasks();
            },
            error: (err) => console.error('Failed to update task status:', err)
        });
    }

    // Get drop list IDs for connecting all lists
    getDropListIds(): string[] {
        const dayIds = this.weekDays.map((_, index) => `day-${index}`);
        return ['unscheduled-list', ...dayIds];
    }
}
