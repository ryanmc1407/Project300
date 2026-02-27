import { Injectable, signal, computed } from '@angular/core';

export type AppMode = 'Business' | 'Project';
export type UserRole = 'Manager' | 'Employee';

@Injectable({ providedIn: 'root' })
export class ModeService {
    private mode = signal<AppMode>('Business');
    private role = signal<UserRole>('Manager');

    isBusinessMode = computed(() => this.mode() === 'Business');
    isProjectMode = computed(() => this.mode() === 'Project');
    isManager = computed(() => this.role() === 'Manager');
    isEmployee = computed(() => this.role() === 'Employee');

    currentMode = this.mode.asReadonly();
    currentRole = this.role.asReadonly();

    setMode(mode: AppMode): void {
        this.mode.set(mode);
    }

    setRole(role: UserRole): void {
        this.role.set(role);
    }

    toggleMode(): void {
        this.mode.set(this.mode() === 'Business' ? 'Project' : 'Business');
    }
}
