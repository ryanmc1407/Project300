import { Routes } from '@angular/router';
import { canActivateAuth } from './auth/access-guard';

export const routes: Routes = [
    // Default redirect
    {
        path: '',
        redirectTo: '/login',
        pathMatch: 'full'
    },

    // Public auth routes
    {
        path: 'login',
        loadComponent: () =>
            import('./pages/login/login').then(m => m.Login)
    },
    {
        path: 'register',
        loadComponent: () =>
            import('./pages/register/register').then(m => m.Register)
    },

    // Protected dashboard shell (contains sidebar + router-outlet)
    {
        path: 'dashboard',
        canActivate: [canActivateAuth],
        loadComponent: () =>
            import('./pages/dashboard/dashboard').then(m => m.Dashboard),
        children: [
            // Default dashboard child
            {
                path: '',
                loadComponent: () =>
                    import('./pages/business-dashboard/business-dashboard').then(m => m.BusinessDashboardComponent)
            },

            // Tasks
            {
                path: 'tasks',
                loadComponent: () =>
                    import('./pages/tasks/tasks').then(m => m.TasksComponent)
            },

            // Planners
            {
                path: 'daily-planner',
                loadComponent: () =>
                    import('./pages/daily-planner/daily-planner').then(m => m.DailyPlannerComponent)
            },
            {
                path: 'weekly-planner',
                loadComponent: () =>
                    import('./pages/weekly-planner/weekly-planner').then(m => m.WeeklyPlannerComponent)
            },

            // AI
            {
                path: 'ai-task-generator',
                loadComponent: () =>
                    import('./pages/ai-prompt/ai-prompt').then(m => m.AIPromptComponent)
            },
            {
                path: 'ai-instructions',
                loadComponent: () =>
                    import('./pages/ai-instructions/ai-instructions').then(m => m.AIInstructionsComponent)
            },

            // Teams & Settings
            {
                path: 'teams',
                loadComponent: () =>
                    import('./pages/teams/teams').then(m => m.TeamsComponent)
            },
            {
                path: 'settings',
                loadComponent: () =>
                    import('./pages/settings/settings').then(m => m.SettingsComponent)
            },

            // Profile & Organization (from new design)
            {
                path: 'profile',
                loadComponent: () =>
                    import('./pages/profile/profile').then(m => m.ProfileComponent)
            },
            {
                path: 'organization',
                loadComponent: () =>
                    import('./pages/organization/organization').then(m => m.OrganizationComponent)
            },
            {
                path: 'projects/:id',
                loadComponent: () =>
                    import('./pages/projects/project-detail').then(m => m.ProjectDetailComponent)
            },
            {
                path: ':id/members',
                loadComponent: () =>
                    import('./pages/members/members').then(m => m.MembersComponent)
            }
        ]
    },

    // Wildcard fallback
    {
        path: '**',
        redirectTo: '/login'
    }
];
