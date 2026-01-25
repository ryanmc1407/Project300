namespace TasclyBackend.API.Models;

// This represents a team member in a project
// Team members can be managers, developers, designers, etc.
public class TeamMember
{
    // Primary key
    public int Id { get; set; }
    
    // Basic info
    public required string Name { get; set; }
    public required string Email { get; set; }
    
    // Role in the project
    public required TeamRole Role { get; set; }
    
    // Avatar URL for profile picture
    public string? AvatarUrl { get; set; }
    
    // Capacity in hours per week
    public decimal CapacityHoursPerWeek { get; set; } = 40;
    
    // Skills/categories (comma-separated for now, can be normalized later)
    public string? Skills { get; set; }
    
    // Permissions - what they can do
    public bool CanAccessBusinessMode { get; set; } = true;
    public bool CanAccessProjectMode { get; set; } = true;
    public bool CanManageTeam { get; set; } = false;
    public bool CanDeleteTasks { get; set; } = false;
    public bool CanEditTasks { get; set; } = true;
    public bool CanViewBoard { get; set; } = true;
    public bool CanAssignTasks { get; set; } = false;
    public bool CanManageSettings { get; set; } = false;
    
    // Foreign keys
    public int ProjectId { get; set; }
    public int UserId { get; set; } // Links to the User account
    
    // Status
    public bool IsActive { get; set; } = true;
    public TeamMemberStatus Status { get; set; } = TeamMemberStatus.Online;
    
    // Timestamps
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public virtual Project? Project { get; set; }
    public virtual User? User { get; set; }
    public virtual ICollection<Task> AssignedTasks { get; set; } = new List<Task>();
}

// Enum for team member roles
public enum TeamRole
{
    Manager,
    Developer,
    Designer,
    QA,
    ProductOwner,
    Stakeholder
}

// Enum for team member status
public enum TeamMemberStatus
{
    Online,
    Offline,
    Busy
}
