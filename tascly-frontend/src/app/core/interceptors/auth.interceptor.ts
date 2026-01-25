import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

// This is THE MOST IMPORTANT part of the authentication system!
// This interceptor automatically attaches the JWT token to every request
// and handles token refresh when the access token expires

// Angular 19 uses functional interceptors instead of class-based ones
// This is cleaner and more functional
export const authInterceptor: HttpInterceptorFn = (req, next) => {
    // Inject the auth service to get the access token
    const authService = inject(AuthService);

    // Get the current access token
    const accessToken = authService.getAccessToken();

    // Clone the request and add the Authorization header if we have a token
    // I'm cloning because HTTP requests are immutable
    let authReq = req;
    if (accessToken) {
        authReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${accessToken}` // This is the JWT token format
            }
        });
    }

    // Send the request and handle errors
    return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
            // If we get a 401 Unauthorized error, it means the access token expired
            if (error.status === 401 && accessToken) {
                // Don't try to refresh if we're already on the refresh endpoint
                // This prevents infinite loops
                if (req.url.includes('/auth/refresh')) {
                    // Refresh token is also expired, log out the user
                    authService.logout();
                    return throwError(() => error);
                }

                // Try to refresh the access token
                return authService.refreshToken().pipe(
                    switchMap(() => {
                        // Token refresh succeeded! Retry the original request with the new token
                        const newAccessToken = authService.getAccessToken();
                        const retryReq = req.clone({
                            setHeaders: {
                                Authorization: `Bearer ${newAccessToken}`
                            }
                        });

                        // Retry the failed request with the new token
                        return next(retryReq);
                    }),
                    catchError((refreshError) => {
                        // Refresh failed, log out the user
                        authService.logout();
                        return throwError(() => refreshError);
                    })
                );
            }

            // For other errors, just pass them through
            return throwError(() => error);
        })
    );
};
