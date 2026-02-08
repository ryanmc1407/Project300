import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
    AuthResponse,
    LoginRequest,
    RegisterRequest,
    RefreshTokenRequest,
    User
} from '../../models';

// This is my authentication service - it handles all login/register/logout logic
// I'm using Angular 19's signal() for reactive state management
@Injectable({
    providedIn: 'root' // This makes it a singleton service available app-wide
})
export class AuthService {
    // Using dependency injection with inject() function (Angular 14+)
    // This is the modern way instead of constructor injection
    private http = inject(HttpClient);
    private router = inject(Router);

    // Signals are Angular 19's new reactive primitive
    // They automatically notify components when the value changes
    // I'm using signal() to track the current user
    currentUser = signal<User | null>(null);

    // Computed signal - automatically updates when currentUser changes
    // This is better than using a getter because it's memoized
    isAuthenticated = signal<boolean>(false);

    constructor() {
        // When the service is created, check if there's a stored user
        this.loadUserFromStorage();
    }

    // Register a new user
    register(request: RegisterRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(
            `${environment.apiUrl}/auth/register`,
            request
        ).pipe(
            // tap() lets me perform side effects without changing the observable
            tap(response => this.handleAuthSuccess(response))
        );
    }

    // Log in an existing user
    login(request: LoginRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(
            `${environment.apiUrl}/auth/login`,
            request
        ).pipe(
            tap(response => this.handleAuthSuccess(response))
        );
    }

    // Refresh the access token using the refresh token
    // This is called automatically by the interceptor when the access token expires
    refreshToken(): Observable<AuthResponse> {
        const refreshToken = this.getRefreshToken();

        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        const request: RefreshTokenRequest = { refreshToken };

        return this.http.post<AuthResponse>(
            `${environment.apiUrl}/auth/refresh`,
            request
        ).pipe(
            tap(response => this.handleAuthSuccess(response))
        );
    }

    // Log out the user
    logout(): void {
        // Clear all stored tokens and user data
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('currentUser');

        // Update signals to reflect logged-out state
        this.currentUser.set(null);
        this.isAuthenticated.set(false);

        // Navigate to login page
        this.router.navigate(['/auth/login']);
    }

    // Get the access token from localStorage
    getAccessToken(): string | null {
        return localStorage.getItem('accessToken');
    }

    // Get the refresh token from localStorage
    getRefreshToken(): string | null {
        return localStorage.getItem('refreshToken');
    }

    // Private helper method to handle successful authentication
    private handleAuthSuccess(response: AuthResponse): void {
        // Store tokens in localStorage
        // Note: In a production app, consider using httpOnly cookies for better security
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);

        // Create user object from response
        const user: User = {
            id: response.userId || 0, // Use userId from backend response
            username: response.username,
            email: response.email
        };

        // Store user data
        localStorage.setItem('currentUser', JSON.stringify(user));

        // Update signals - this will automatically update all components using these signals
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
    }

    // Load user from localStorage on app startup
    private loadUserFromStorage(): void {
        const userJson = localStorage.getItem('currentUser');
        const accessToken = this.getAccessToken();

        if (userJson && accessToken) {
            const user = JSON.parse(userJson) as User;
            this.currentUser.set(user);
            this.isAuthenticated.set(true);
        }
    }
}
