import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TeamService } from '../../../core/services/team.service';
import { TeamMember, TeamRole, TeamMemberStatus } from '../../../models/team-member.model';

// Teams Component
// Displays team members with their roles, status, and workload
@Component({
    selector: 'app-teams',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './teams.html',
    styleUrl: './teams.css'
})
export class TeamsComponent implements OnInit {
    private teamService = inject(TeamService);

    teamMembers: TeamMember[] = [];

    // For adding new member
    newMemberEmail: string = '';
    newMemberRole: TeamRole = TeamRole.Developer;
    roles = Object.values(TeamRole).filter(r => typeof r === 'string') as string[];
    showAddForm = false;

    // Get current project ID - for now hardcoded or fetched from somewhere
    currentProjectId = 1;

    ngOnInit() {
        this.loadTeamMembers();
    }

    loadTeamMembers() {
        // Fetch real data
        this.teamService.getTeamMembersByProject(this.currentProjectId).subscribe({
            next: (members) => {
                this.teamMembers = members;
            },
            error: (err) => console.error('Failed to load team members', err)
        });
    }

    addMember() {
        if (!this.newMemberEmail) return;

        const newMember = {
            email: this.newMemberEmail,
            role: this.newMemberRole,
            projectId: this.currentProjectId
        };

        // Call API
        // Note: I need to update TeamService to support the AddTeamMemberDto structure
        // But for now, let's see if createTeamMember works or if I need to add a specifc method
        this.teamService.createTeamMember(newMember).subscribe({
            next: (member) => {
                this.teamMembers.push(member);
                this.newMemberEmail = '';
                this.showAddForm = false;
            },
            error: (err) => {
                console.error('Failed to add member', err);
                alert('Failed to add member: ' + (err.error?.message || err.message));
            }
        });
    }

    getRoleColor(role: TeamRole | string): string {
        switch (role) {
            case TeamRole.Manager:
            case 'Manager': return 'purple';
            case TeamRole.Developer:
            case 'Developer': return 'blue';
            case TeamRole.Designer:
            case 'Designer': return 'pink';
            case TeamRole.QA:
            case 'QA': return 'green';
            case TeamRole.ProductOwner:
            case 'ProductOwner': return 'orange';
            default: return 'gray';
        }
    }

    getStatusClass(status: TeamMemberStatus): string {
        return status ? status.toString().toLowerCase() : 'offline';
    }

    getInitials(name: string): string {
        return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';
    }
}
