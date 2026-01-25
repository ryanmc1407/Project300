namespace TasclyBackend.API.Models;

// This is my Project model - represents a project in the Tascly system
// Each project belongs to one user (the owner)
public class Project
{
    // Primary key for the project
    public int Id { get; set; }
    
    // Name of the project - required field
    public required string Name { get; set; }
    
    // Description of what the project is about - optional
    public string? Description { get; set; }
    
    // Foreign key - this links the project to the user who owns it
    // When I create a project, I'll set this to the logged-in user's ID
    public int OwnerId { get; set; }
    
    // Navigation property - this lets me access the owner's full User object
    // The virtual keyword helps Entity Framework with lazy loading
    public virtual User? Owner { get; set; }
    
    // Timestamp for when the project was created
    // I'm using DateTime.UtcNow to store in UTC timezone
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties for related entities
    // These let me access all tasks, team members, and sprints for this project
    public virtual ICollection<Task> Tasks { get; set; } = new List<Task>();
    public virtual ICollection<TeamMember> TeamMembers { get; set; } = new List<TeamMember>();
    public virtual ICollection<Sprint> Sprints { get; set; } = new List<Sprint>();
}
