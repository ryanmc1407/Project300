import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../data/services/task.service';
import { Task } from '../../data/interfaces/tasks/task.interface';

@Component({
    selector: 'app-daily-planner',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './daily-planner.html',
    styleUrl: './daily-planner.css'
})
export class DailyPlannerComponent implements OnInit {
    private taskService = inject(TaskService);

    today = new Date();
    timeSlots: { hour: number; label: string; tasks: Task[] }[] = [];
    unscheduledTasks: Task[] = [];
    todaysTasks = signal<Task[]>([]);
    isLoading = signal<boolean>(false);
    error = signal<string | null>(null);

    // Navigate between days
    currentDate = signal<Date>(new Date());

    ngOnInit() {
        this.initializeTimeSlots();
        this.loadTasks();
    }

    initializeTimeSlots() {
        this.timeSlots = [];
        for (let hour = 8; hour <= 20; hour++) {
            const period = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour > 12 ? hour - 12 : hour;
            this.timeSlots.push({ hour, label: `${displayHour}:00 ${period}`, tasks: [] });
        }
    }

    async loadTasks() {
        this.isLoading.set(true);
        this.initializeTimeSlots();
        try {
            const tasks = await this.taskService.getDailyTasks(this.currentDate());
            this.todaysTasks.set(tasks);
            this.distributeTasks(tasks);
        } catch {
            this.error.set('Failed to load daily tasks.');
        } finally {
            this.isLoading.set(false);
        }
    }

    distributeTasks(tasks: Task[]) {
        this.unscheduledTasks = [];
        tasks.forEach(task => {
            if (task.startDate) {
                const hour = new Date(task.startDate).getHours();
                const slot = this.timeSlots.find(s => s.hour === hour);
                if (slot) {
                    slot.tasks.push(task);
                } else {
                    this.unscheduledTasks.push(task);
                }
            } else {
                this.unscheduledTasks.push(task);
            }
        });
    }

    prevDay() {
        const d = new Date(this.currentDate());
        d.setDate(d.getDate() - 1);
        this.currentDate.set(d);
        this.loadTasks();
    }

    nextDay() {
        const d = new Date(this.currentDate());
        d.setDate(d.getDate() + 1);
        this.currentDate.set(d);
        this.loadTasks();
    }

    getFormattedDate(): string {
        return this.currentDate().toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    }

    isToday(): boolean {
        const t = new Date();
        const c = this.currentDate();
        return t.toDateString() === c.toDateString();
    }

    getImportanceClass(name: string): string {
        return name?.toLowerCase() ?? 'medium';
    }
}
