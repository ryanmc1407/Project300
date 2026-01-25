import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Project, CreateProjectRequest } from '../../models';

// This service handles all project-related API calls
// It's in the core/services folder because it's used across multiple features
@Injectable({
    providedIn: 'root' // Singleton service
})
export class ProjectService {
    // Modern dependency injection using inject() function
    private http = inject(HttpClient);

    // Get all projects for the current user
    // The backend automatically filters by the logged-in user from the JWT token
    getMyProjects(): Observable<Project[]> {
        return this.http.get<Project[]>(`${environment.apiUrl}/projects`);
    }

    // Create a new project
    // The backend automatically sets the OwnerId from the JWT token
    createProject(request: CreateProjectRequest): Observable<Project> {
        return this.http.post<Project>(`${environment.apiUrl}/projects`, request);
    }

    // Note: I can add more methods here later like:
    // - updateProject()
    // - deleteProject()
    // - getProjectById()
}
