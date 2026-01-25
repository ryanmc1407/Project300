import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

// This is my application configuration
// In Angular 19, we configure providers here instead of in NgModules
export const appConfig: ApplicationConfig = {
  providers: [
    // Enable zone-based change detection with event coalescing for better performance
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Provide the router with my routes
    provideRouter(routes),

    // Provide HttpClient with the auth interceptor
    // The interceptor will automatically add JWT tokens to requests
    // This is THE KEY to keeping users logged in!
    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ]
};
