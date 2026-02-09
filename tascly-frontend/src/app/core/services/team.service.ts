import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TeamMember, TeamMemberStatus } from '../../models/team-member.model';
import { environment } from '../../../environments/environment';

// Service for managing team members
// Handles team member data, permissions, and status updates
@Injectable({
    providedIn: 'root'
})
export class TeamService {
    private apiUrl = `${environment.apiUrl}/team-members`;

    // Signal to hold the current team members
    teamMembers = signal<TeamMember[]>([]);

    constructor(private http: HttpClient) { }

    // Get all team members
    getAllTeamMembers(): Observable<TeamMember[]> {
        return this.http.get<TeamMember[]>(this.apiUrl);
    }

    // Get team member by ID
    getTeamMemberById(id: number): Observable<TeamMember> {
        return this.http.get<TeamMember>(`${this.apiUrl}/${id}`);
    }

    // Get team members by project
    getTeamMembersByProject(projectId: number): Observable<TeamMember[]> {
        return this.http.get<TeamMember[]>(`${this.apiUrl}/project/${projectId}`);
    }

    // Get active team members
    getActiveTeamMembers(): Observable<TeamMember[]> {
        return this.http.get<TeamMember[]>(`${this.apiUrl}/active`);
    }

    // Create a new team member
    createTeamMember(teamMember: Partial<TeamMember>): Observable<TeamMember> {
        return this.http.post<TeamMember>(this.apiUrl, teamMember);
    }

    // Update team member
    updateTeamMember(id: number, teamMember: Partial<TeamMember>): Observable<TeamMember> {
        return this.http.put<TeamMember>(`${this.apiUrl}/${id}`, teamMember);
    }

    // Delete team member
    deleteTeamMember(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    // Update team member status
    updateStatus(id: number, status: TeamMemberStatus): Observable<TeamMember> {
        return this.http.patch<TeamMember>(`${this.apiUrl}/${id}/status`, { status });
    }

    // Update team member permissions
    updatePermissions(id: number, permissions: Partial<TeamMember>): Observable<TeamMember> {
        return this.http.patch<TeamMember>(`${this.apiUrl}/${id}/permissions`, permissions);
    }

    // Get team member workload (tasks assigned)
    getTeamMemberWorkload(id: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${id}/workload`);
    }
}
