import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamService } from '../../../core/services/team.service';
import { TeamMember, TeamRole, TeamMemberStatus } from '../../../models/team-member.model';

// Teams Component
// Displays team members with their roles, status, and workload
@Component({
    selector: 'app-teams',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './teams.html',
    styleUrl: './teams.css'
})
export class TeamsComponent implements OnInit {
    private teamService = inject(TeamService);

    teamMembers: TeamMember[] = [];

    ngOnInit() {
        this.loadTeamMembers();
    }

    loadTeamMembers() {
        // Mock data
        this.teamMembers = [
            {
                id: 1,
                name: 'Sarah Johnson',
                email: 'sarah.j@tascly.com',
                role: TeamRole.Manager,
                avatarUrl: undefined,
                capacityHoursPerWeek: 40,
                skills: 'Leadership, Strategy, Planning',
                canAccessBusinessMode: true,
                canAccessProjectMode: true,
                canManageTeam: true,
                canDeleteTasks: true,
                canEditTasks: true,
                canViewBoard: true,
                canAssignTasks: true,
                canManageSettings: true,
                projectId: 1,
                userId: 1,
                isActive: true,
                status: TeamMemberStatus.Online,
                joinedAt: new Date('2025-01-01')
            },
            {
                id: 2,
                name: 'Alex Chen',
                email: 'alex.c@tascly.com',
                role: TeamRole.Developer,
                avatarUrl: undefined,
                capacityHoursPerWeek: 40,
                skills: 'Angular, TypeScript, C#',
                canAccessBusinessMode: false,
                canAccessProjectMode: true,
                canManageTeam: false,
                canDeleteTasks: false,
                canEditTasks: true,
                canViewBoard: true,
                canAssignTasks: false,
                canManageSettings: false,
                projectId: 1,
                userId: 2,
                isActive: true,
                status: TeamMemberStatus.Busy,
                joinedAt: new Date('2025-01-15')
            },
            {
                id: 3,
                name: 'Maria Garcia',
                email: 'maria.g@tascly.com',
                role: TeamRole.Designer,
                avatarUrl: undefined,
                capacityHoursPerWeek: 40,
                skills: 'UI/UX, Figma, Design Systems',
                canAccessBusinessMode: false,
                canAccessProjectMode: true,
                canManageTeam: false,
                canDeleteTasks: false,
                canEditTasks: true,
                canViewBoard: true,
                canAssignTasks: false,
                canManageSettings: false,
                projectId: 1,
                userId: 3,
                isActive: true,
                status: TeamMemberStatus.Online,
                joinedAt: new Date('2025-02-01')
            },
            {
                id: 4,
                name: 'James Wilson',
                email: 'james.w@tascly.com',
                role: TeamRole.QA,
                avatarUrl: undefined,
                capacityHoursPerWeek: 40,
                skills: 'Testing, Automation, Quality Assurance',
                canAccessBusinessMode: false,
                canAccessProjectMode: true,
                canManageTeam: false,
                canDeleteTasks: false,
                canEditTasks: true,
                canViewBoard: true,
                canAssignTasks: false,
                canManageSettings: false,
                projectId: 1,
                userId: 4,
                isActive: true,
                status: TeamMemberStatus.Offline,
                joinedAt: new Date('2025-03-01')
            }
        ];
    }

    getRoleColor(role: TeamRole): string {
        switch (role) {
            case TeamRole.Manager: return 'purple';
            case TeamRole.Developer: return 'blue';
            case TeamRole.Designer: return 'pink';
            case TeamRole.QA: return 'green';
            case TeamRole.ProductOwner: return 'orange';
            default: return 'gray';
        }
    }

    getStatusClass(status: TeamMemberStatus): string {
        return status.toLowerCase();
    }

    getInitials(name: string): string {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
}
