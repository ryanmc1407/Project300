import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

// This is my routing configuration using Angular 19's standalone components
// I'm organizing routes by feature for better code organization
export const routes: Routes = [
    // Default route - redirect to dashboard if logged in, otherwise to login
    {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full'
    },

    // Auth routes (login, register) - these are public routes
    {
        path: 'auth',
        children: [
            {
                path: 'login',
                // Lazy loading the component for better performance
                loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
            },
            {
                path: 'register',
                loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
            }
        ]
    },

    // Protected routes - require authentication
    {
        path: 'dashboard',
        // The authGuard will check if the user is logged in
        canActivate: [authGuard],
        loadComponent: () => import('./features/dashboard/business-dashboard/business-dashboard').then(m => m.BusinessDashboardComponent)
    },
    {
        path: 'daily-planner',
        canActivate: [authGuard],
        loadComponent: () => import('./features/planner/daily-planner/daily-planner').then(m => m.DailyPlannerComponent)
    },
    {
        path: 'weekly-planner',
        canActivate: [authGuard],
        loadComponent: () => import('./features/planner/weekly-planner/weekly-planner').then(m => m.WeeklyPlannerComponent)
    },
    {
        path: 'ai-assistant',
        canActivate: [authGuard],
        loadComponent: () => import('./features/ai/ai-assistant/ai-assistant').then(m => m.AIAssistantComponent)
    },
    {
        path: 'project-board',
        canActivate: [authGuard],
        loadComponent: () => import('./features/projects/dashboard/dashboard.component').then(m => m.DashboardComponent) // Placeholder for now
    },
    {
        path: 'tasks',
        canActivate: [authGuard],
        loadComponent: () => import('./features/tasks/tasks-list/tasks').then(m => m.TasksComponent)
    },
    {
        path: 'teams',
        canActivate: [authGuard],
        loadComponent: () => import('./features/teams/teams-list/teams').then(m => m.TeamsComponent)
    },
    {
        path: 'settings',
        canActivate: [authGuard],
        loadComponent: () => import('./features/settings/settings/settings').then(m => m.SettingsComponent)
    },

    // Wildcard route - redirect to dashboard if route not found
    {
        path: '**',
        redirectTo: '/dashboard'
    }
];
