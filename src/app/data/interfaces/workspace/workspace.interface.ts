// Workspace and Project interfaces matching new backend API shape

export interface Workspace {
    id: string;
    name: string;
    organizationId: string;
    members: string[];
}

export interface PostWorkspace {
    name: string;
}

export interface Project {
    id: string;
    name: string;
    workspaceId: string;
}

export interface PostProject {
    name: string;
}

export interface TeamMember {
    userId: string;
    username: string;
    firstName: string;
    lastName: string;
    role: string;
}

export interface AddMemberRequest {
    userId: string;
}
