import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

// This is my login component - it's a standalone component (Angular 19 best practice)
// Standalone components don't need NgModules, making the app simpler
@Component({
    selector: 'app-login',
    standalone: true, // This is the new Angular way!
    imports: [
        CommonModule, // Gives me *ngIf, *ngFor, etc.
        ReactiveFormsModule, // For reactive forms
        RouterLink // For navigation links
    ],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class LoginComponent {
    // Modern dependency injection using inject() function
    private authService = inject(AuthService);
    private fb = inject(FormBuilder);
    private router = inject(Router);

    // Using signals for reactive state management (Angular 19)
    // Signals automatically update the template when the value changes
    isLoading = signal(false);
    errorMessage = signal<string | null>(null);

    // Reactive form for login
    // I'm using FormBuilder to create the form with validation
    loginForm: FormGroup = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Handle form submission
    onSubmit(): void {
        // Check if the form is valid
        if (this.loginForm.invalid) {
            // Mark all fields as touched to show validation errors
            this.loginForm.markAllAsTouched();
            return;
        }

        // Set loading state
        this.isLoading.set(true);
        this.errorMessage.set(null);

        // Get form values
        const { email, password } = this.loginForm.value;

        // Call the auth service to log in
        this.authService.login({ email, password }).subscribe({
            next: () => {
                // Login successful! Navigate to dashboard
                this.isLoading.set(false);
                this.router.navigate(['/dashboard']);
            },
            error: (error) => {
                // Login failed, show error message
                this.isLoading.set(false);
                this.errorMessage.set(
                    error.error?.message || 'Login failed. Please check your credentials.'
                );
            }
        });
    }

    // Helper method to check if a field has an error
    hasError(fieldName: string, errorType: string): boolean {
        const field = this.loginForm.get(fieldName);
        return !!(field?.hasError(errorType) && field?.touched);
    }
}
