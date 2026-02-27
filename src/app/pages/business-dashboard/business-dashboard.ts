import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth } from '../../auth/auth';

@Component({
    selector: 'app-business-dashboard',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './business-dashboard.html',
    styleUrl: './business-dashboard.css'
})
export class BusinessDashboardComponent {
    private authService = inject(Auth);

    username = this.authService.username;

    todaysTasks = { total: 12, completed: 5, remaining: 7 };

    overdueItems = [
        { title: 'Client proposal sign-off', daysOverdue: 2, priority: 'high' },
        { title: 'Update team OKRs', daysOverdue: 1, priority: 'medium' },
        { title: 'Share budget draft', daysOverdue: 0, priority: 'medium' }
    ];

    teamActivity = {
        total: 34,
        updates: [
            { user: 'Maria', action: 'added meeting notes', time: '2h ago' },
            { user: 'Alex', action: 'completed weekly summary', time: '5h ago' },
            { user: 'Jordan', action: 'rescheduled client call', time: 'Yesterday' }
        ]
    };

    highPriorityItems = [
        { title: 'Review weekly performance metrics', assignee: 'You', due: 'Today 5:00 PM', priority: 'high' },
        { title: 'Approve hiring pipeline changes', assignee: 'You', due: 'Tomorrow', priority: 'medium' },
        { title: 'Prepare Q2 planning agenda', assignee: 'You', due: 'Fri', priority: 'high' }
    ];
}
