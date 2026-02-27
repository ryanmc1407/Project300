import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface OrganizationMember {
    id: string;
    firstName: string;
    lastName: string;
    userName: string;
    role?: string;
    isAdmin?: boolean;
}

export interface OrganizationWorkspace {
    id: string;
    name: string;
}

export interface OrganizationOverview {
    id: string;
    name: string;
    memberCount?: number;
    totalTasks?: number;
    totalCompletedTasks?: number;
    totalInProgressTasks?: number;
    totalToDoTasks?: number;
    members?: OrganizationMember[];
    workspaces?: OrganizationWorkspace[];
}

@Injectable({ providedIn: 'root' })
export class OrganizationsService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl;

    getOrganizationOverview(): Observable<OrganizationOverview> {
        return this.http.get<OrganizationOverview>(`${this.apiUrl}/Organizations/overview`);
    }

    putOrganization(payload: { name: string }): Observable<any> {
        return this.http.put(`${this.apiUrl}/Organizations`, payload);
    }
}
