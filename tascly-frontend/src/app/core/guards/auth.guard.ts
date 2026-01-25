import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// This guard protects routes that require authentication
// If the user is not logged in, they get redirected to the login page

// Angular 19 uses functional guards instead of class-based ones
export const authGuard: CanActivateFn = (route, state) => {
    // Inject dependencies
    const authService = inject(AuthService);
    const router = inject(Router);

    // Check if the user is authenticated using the signal
    if (authService.isAuthenticated()) {
        // User is logged in, allow access
        return true;
    }

    // User is not logged in, redirect to login page
    // I'm passing the returnUrl so we can redirect back after login
    router.navigate(['/auth/login'], {
        queryParams: { returnUrl: state.url }
    });

    return false;
};
