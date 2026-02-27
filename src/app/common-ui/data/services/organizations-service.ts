import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface OrganizationOverview {
    id: string;
    name: string;
    memberCount?: number;
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
