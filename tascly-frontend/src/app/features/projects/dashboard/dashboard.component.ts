import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ProjectService } from '../../../core/services/project.service';
import { Project } from '../../../models';

// Dashboard component - shows the user's projects and lets them create new ones
@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
    private authService = inject(AuthService);
    private projectService = inject(ProjectService);
    private fb = inject(FormBuilder);
    private router = inject(Router);

    // Using signals for reactive state
    projects = signal<Project[]>([]);
    isLoading = signal(false);
    showCreateForm = signal(false);
    errorMessage = signal<string | null>(null);

    // Get current user from auth service (this is also a signal)
    currentUser = this.authService.currentUser;

    // Form for creating new projects
    createProjectForm: FormGroup = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(3)]],
        description: ['']
    });

    ngOnInit(): void {
        // Load projects when component initializes
        this.loadProjects();
    }

    // Load all projects for the current user
    loadProjects(): void {
        this.isLoading.set(true);
        this.errorMessage.set(null);

        this.projectService.getMyProjects().subscribe({
            next: (projects) => {
                this.projects.set(projects);
                this.isLoading.set(false);
            },
            error: (error) => {
                this.errorMessage.set('Failed to load projects');
                this.isLoading.set(false);
                console.error('Error loading projects:', error);
            }
        });
    }

    // Toggle the create project form
    toggleCreateForm(): void {
        this.showCreateForm.set(!this.showCreateForm());
        if (!this.showCreateForm()) {
            this.createProjectForm.reset();
        }
    }

    // Create a new project
    onCreateProject(): void {
        if (this.createProjectForm.invalid) {
            this.createProjectForm.markAllAsTouched();
            return;
        }

        this.isLoading.set(true);
        this.errorMessage.set(null);

        const { name, description } = this.createProjectForm.value;

        this.projectService.createProject({ name, description }).subscribe({
            next: (newProject) => {
                // Add the new project to the list
                this.projects.update(projects => [...projects, newProject]);

                // Reset form and hide it
                this.createProjectForm.reset();
                this.showCreateForm.set(false);
                this.isLoading.set(false);
            },
            error: (error) => {
                this.errorMessage.set('Failed to create project');
                this.isLoading.set(false);
                console.error('Error creating project:', error);
            }
        });
    }

    // Log out the user
    onLogout(): void {
        this.authService.logout();
    }

    // Helper method for form validation
    hasError(fieldName: string, errorType: string): boolean {
        const field = this.createProjectForm.get(fieldName);
        return !!(field?.hasError(errorType) && field?.touched);
    }
}
