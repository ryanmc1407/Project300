namespace TasclyBackend.API.Models;

// This represents a file attachment on a task
// Team members can upload files to tasks
public class TaskAttachment
{
    // Primary key
    public int Id { get; set; }
    
    // File information
    public required string FileName { get; set; }
    public required string FileUrl { get; set; }
    public long FileSize { get; set; } // in bytes
    public string? ContentType { get; set; }
    
    // Foreign keys
    public int TaskId { get; set; }
    public int UploadedById { get; set; }
    
    // Timestamp
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public virtual Task? Task { get; set; }
    public virtual User? UploadedBy { get; set; }
}
