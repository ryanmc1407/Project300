namespace TasclyBackend.API.Models;

// This represents a sprint in a project
// Sprints are used in Project Mode to organize work into time-boxed iterations
public class Sprint
{
    // Primary key
    public int Id { get; set; }
    
    // Sprint name (e.g., "Sprint 14", "Q1 Product Launch")
    public required string Name { get; set; }
    
    // Sprint goal/objective
    public string? Goal { get; set; }
    
    // Sprint timeline
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    
    // Sprint status
    public SprintStatus Status { get; set; } = SprintStatus.Planning;
    
    // Foreign key
    public int ProjectId { get; set; }
    
    // Timestamps
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public virtual Project? Project { get; set; }
    public virtual ICollection<Task> Tasks { get; set; } = new List<Task>();
}

// Enum for sprint status
public enum SprintStatus
{
    Planning,
    Active,
    Completed,
    Cancelled
}
