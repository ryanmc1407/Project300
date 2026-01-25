import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

// Register component - lets new users create an account
@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './register.component.html',
    styleUrl: './register.component.css'
})
export class RegisterComponent {
    private authService = inject(AuthService);
    private fb = inject(FormBuilder);
    private router = inject(Router);

    isLoading = signal(false);
    errorMessage = signal<string | null>(null);

    // Register form with validation
    registerForm: FormGroup = this.fb.group({
        username: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]]
    }, {
        // Custom validator to check if passwords match
        validators: this.passwordMatchValidator
    });

    // Custom validator function to check if password and confirmPassword match
    private passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
        const password = group.get('password')?.value;
        const confirmPassword = group.get('confirmPassword')?.value;

        return password === confirmPassword ? null : { passwordMismatch: true };
    }

    onSubmit(): void {
        if (this.registerForm.invalid) {
            this.registerForm.markAllAsTouched();
            return;
        }

        this.isLoading.set(true);
        this.errorMessage.set(null);

        const { username, email, password } = this.registerForm.value;

        this.authService.register({ username, email, password }).subscribe({
            next: () => {
                this.isLoading.set(false);
                this.router.navigate(['/dashboard']);
            },
            error: (error) => {
                this.isLoading.set(false);
                this.errorMessage.set(
                    error.error?.message || 'Registration failed. Please try again.'
                );
            }
        });
    }

    hasError(fieldName: string, errorType: string): boolean {
        const field = this.registerForm.get(fieldName);
        return !!(field?.hasError(errorType) && field?.touched);
    }

    // Check if passwords don't match
    get passwordMismatch(): boolean {
        return !!(
            this.registerForm.hasError('passwordMismatch') &&
            this.registerForm.get('confirmPassword')?.touched
        );
    }
}
