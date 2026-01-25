import { Injectable, signal, computed } from '@angular/core';

// This service manages the active mode (Business vs Project)
// and the user's role (Manager vs Employee)
@Injectable({
    providedIn: 'root'
})
export class ModeService {
    // Signal for the active mode - Business or Project
    activeMode = signal<'business' | 'project'>('business');

    // Signal for the user's role - determines which views they see
    userRole = signal<'manager' | 'employee'>('manager');

    // Computed signal to check if in Business Mode
    isBusinessMode = computed(() => this.activeMode() === 'business');

    // Computed signal to check if in Project Mode
    isProjectMode = computed(() => this.activeMode() === 'project');

    // Computed signal to check if user is a manager
    isManager = computed(() => this.userRole() === 'manager');

    // Computed signal to check if user is an employee
    isEmployee = computed(() => this.userRole() === 'employee');

    // Switch to Business Mode
    switchToBusinessMode(): void {
        this.activeMode.set('business');
    }

    // Switch to Project Mode
    switchToProjectMode(): void {
        this.activeMode.set('project');
    }

    // Toggle between modes
    toggleMode(): void {
        this.activeMode.set(this.activeMode() === 'business' ? 'project' : 'business');
    }

    // Set user role (called after login based on backend response)
    setUserRole(role: 'manager' | 'employee'): void {
        this.userRole.set(role);
    }
}
