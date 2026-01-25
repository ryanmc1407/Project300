namespace TasclyBackend.API.Models;

// This represents a task in the system
// Tasks can be in Business Mode (for managers) or Project Mode (for team members)
public class Task
{
    // Primary key
    public int Id { get; set; }
    
    // Task title - required
    public required string Title { get; set; }
    
    // Detailed description of the task
    public string? Description { get; set; }
    
    // Priority level - High, Medium, Low
    public required TaskPriority Priority { get; set; }
    
    // Type of task - Bug, Feature, Improvement
    public required TaskType Type { get; set; }
    
    // Current status - Backlog, Todo, InProgress, Done
    public required TaskStatus Status { get; set; }
    
    // Due date and time
    public DateTime? DueDate { get; set; }
    
    // Estimated hours to complete
    public decimal? EstimatedHours { get; set; }
    
    // Actual hours spent
    public decimal? ActualHours { get; set; }
    
    // When the task is scheduled (for daily/weekly planner)
    public DateTime? ScheduledStart { get; set; }
    public DateTime? ScheduledEnd { get; set; }
    
    // Foreign keys
    public int ProjectId { get; set; }
    public int? AssignedToId { get; set; } // TeamMember who is assigned
    public int CreatedById { get; set; } // User who created it
    public int? SprintId { get; set; } // Optional sprint assignment
    
    // Timestamps
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    
    // Navigation properties
    public virtual Project? Project { get; set; }
    public virtual TeamMember? AssignedTo { get; set; }
    public virtual User? CreatedBy { get; set; }
    public virtual Sprint? Sprint { get; set; }
    public virtual ICollection<TaskComment> Comments { get; set; } = new List<TaskComment>();
    public virtual ICollection<TaskAttachment> Attachments { get; set; } = new List<TaskAttachment>();
}

// Enum for task priority
public enum TaskPriority
{
    Low = 1,
    Medium = 2,
    High = 3
}

// Enum for task type
public enum TaskType
{
    Bug,
    Feature,
    Improvement
}

// Enum for task status (matches Kanban columns)
public enum TaskStatus
{
    Backlog,
    Todo,
    InProgress,
    Done
}
