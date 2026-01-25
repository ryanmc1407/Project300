namespace TasclyBackend.API.Models;

// This represents a comment on a task
// Team members can discuss tasks using comments
public class TaskComment
{
    // Primary key
    public int Id { get; set; }
    
    // Comment content
    public required string Content { get; set; }
    
    // Foreign keys
    public int TaskId { get; set; }
    public int AuthorId { get; set; }
    
    // Timestamp
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public virtual Task? Task { get; set; }
    public virtual User? Author { get; set; }
}
