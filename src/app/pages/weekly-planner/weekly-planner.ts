import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../data/services/task.service';
import { Task } from '../../data/interfaces/tasks/task.interface';

@Component({
    selector: 'app-weekly-planner',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './weekly-planner.html',
    styleUrl: './weekly-planner.css'
})
export class WeeklyPlannerComponent implements OnInit {
    private taskService = inject(TaskService);

    weekDays: { date: Date; label: string; tasks: Task[] }[] = [];
    weekStart = signal<Date>(this.getMonday(new Date()));
    isLoading = signal<boolean>(false);
    error = signal<string | null>(null);

    ngOnInit() {
        this.loadWeek();
    }

    getMonday(date: Date): Date {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        d.setDate(diff);
        d.setHours(0, 0, 0, 0);
        return d;
    }

    async loadWeek() {
        this.isLoading.set(true);
        try {
            const tasks = await this.taskService.getWeeklyTasks(this.weekStart());
            this.buildWeekDays(tasks);
        } catch {
            this.error.set('Failed to load weekly tasks.');
        } finally {
            this.isLoading.set(false);
        }
    }

    buildWeekDays(tasks: Task[]) {
        this.weekDays = [];
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        for (let i = 0; i < 7; i++) {
            const d = new Date(this.weekStart());
            d.setDate(d.getDate() + i);
            const dayTasks = tasks.filter(t => {
                if (!t.dueDate) return false;
                const due = new Date(t.dueDate);
                return due.toDateString() === d.toDateString();
            });
            this.weekDays.push({ date: d, label: days[i], tasks: dayTasks });
        }
    }

    prevWeek() {
        const d = new Date(this.weekStart());
        d.setDate(d.getDate() - 7);
        this.weekStart.set(d);
        this.loadWeek();
    }

    nextWeek() {
        const d = new Date(this.weekStart());
        d.setDate(d.getDate() + 7);
        this.weekStart.set(d);
        this.loadWeek();
    }

    getWeekLabel(): string {
        const end = new Date(this.weekStart());
        end.setDate(end.getDate() + 6);
        const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
        return `${this.weekStart().toLocaleDateString('en-US', opts)} – ${end.toLocaleDateString('en-US', opts)}`;
    }

    isToday(date: Date): boolean {
        return date.toDateString() === new Date().toDateString();
    }

    getImportanceClass(name: string): string {
        return name?.toLowerCase() ?? 'medium';
    }
}
