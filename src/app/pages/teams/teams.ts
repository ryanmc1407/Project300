import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { TeamMember } from '../../data/interfaces/workspace/workspace.interface';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-teams',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './teams.html',
    styleUrl: './teams.css'
})
export class TeamsComponent implements OnInit {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl;

    teamMembers = signal<TeamMember[]>([]);
    isLoading = signal<boolean>(false);
    error = signal<string | null>(null);

    // Current workspace — in real usage this comes from workspace context/route
    currentWorkspaceId = signal<string>('');

    ngOnInit() {
        // Load members once workspace is selected
        // For now show empty state — will be populated from sidebar workspace selection
    }

    async loadMembers(workspaceId: string) {
        this.currentWorkspaceId.set(workspaceId);
        this.isLoading.set(true);
        try {
            const members = await firstValueFrom(
                this.http.get<TeamMember[]>(`${this.apiUrl}/Workspaces/${workspaceId}/Members`)
            );
            this.teamMembers.set(members);
        } catch {
            this.error.set('Failed to load team members.');
        } finally {
            this.isLoading.set(false);
        }
    }

    async removeMember(userId: string) {
        const workspaceId = this.currentWorkspaceId();
        if (!workspaceId) return;
        try {
            await firstValueFrom(
                this.http.delete(`${this.apiUrl}/Workspaces/${workspaceId}/Members/${userId}`)
            );
            await this.loadMembers(workspaceId);
        } catch {
            this.error.set('Failed to remove member.');
        }
    }

    getInitials(member: TeamMember): string {
        return `${member.firstName?.[0] ?? ''}${member.lastName?.[0] ?? ''}`.toUpperCase();
    }
}
