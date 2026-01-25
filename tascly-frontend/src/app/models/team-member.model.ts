// TeamMember model matching the backend TeamMember.cs model
// This represents a team member in a project with their role, permissions, and status

export interface TeamMember {
    id: number;
    name: string;
    email: string;
    role: TeamRole;
    avatarUrl?: string;
    capacityHoursPerWeek: number;
    skills?: string;

    // Permissions
    canAccessBusinessMode: boolean;
    canAccessProjectMode: boolean;
    canManageTeam: boolean;
    canDeleteTasks: boolean;
    canEditTasks: boolean;
    canViewBoard: boolean;
    canAssignTasks: boolean;
    canManageSettings: boolean;

    // Foreign keys
    projectId: number;
    userId: number;

    // Status
    isActive: boolean;
    status: TeamMemberStatus;

    // Timestamps
    joinedAt: Date;
}

// Enum for team member roles
export enum TeamRole {
    Manager = 'Manager',
    Developer = 'Developer',
    Designer = 'Designer',
    QA = 'QA',
    ProductOwner = 'ProductOwner',
    Stakeholder = 'Stakeholder'
}

// Enum for team member status
export enum TeamMemberStatus {
    Online = 'Online',
    Offline = 'Offline',
    Busy = 'Busy'
}
