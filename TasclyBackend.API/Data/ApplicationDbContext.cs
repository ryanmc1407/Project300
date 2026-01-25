using Microsoft.EntityFrameworkCore;
using TasclyBackend.API.Models;

namespace TasclyBackend.API.Data;

// This is my database context - it's like a bridge between my C# code and the database
// Entity Framework uses this to know what tables to create and how to query them
public class ApplicationDbContext : DbContext
{
    // Constructor - I'm using dependency injection to get the options
    // The options tell EF Core which database to use (SQLite in this case)
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) 
        : base(options)
    {
    }
    
    // DbSet represents a table in the database
    // This creates a "Users" table with all the properties from the User model
    public DbSet<User> Users { get; set; }
    
    // This creates a "Projects" table
    public DbSet<Project> Projects { get; set; }
    
    // DbSets for the new models
    // These create tables for tasks, team members, sprints, modes, comments, and attachments
    // Using fully qualified name for Task to avoid conflict with System.Threading.Tasks.Task
    public DbSet<Models.Task> Tasks { get; set; }
    public DbSet<TeamMember> TeamMembers { get; set; }
    public DbSet<Sprint> Sprints { get; set; }
    public DbSet<Mode> Modes { get; set; }
    public DbSet<TaskComment> TaskComments { get; set; }
    public DbSet<TaskAttachment> TaskAttachments { get; set; }
    
    // This method is called when EF Core is building the model
    // I can use it to configure relationships and constraints
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // Configure the User entity
        modelBuilder.Entity<User>(entity =>
        {
            // Make sure email is unique - can't have two users with the same email
            entity.HasIndex(u => u.Email).IsUnique();
            
            // Also make username unique
            entity.HasIndex(u => u.Username).IsUnique();
        });
        
        // Configure the Project entity
        modelBuilder.Entity<Project>(entity =>
        {
            // Set up the relationship between Project and User
            // One user can have many projects (one-to-many relationship)
            entity.HasOne(p => p.Owner)
                .WithMany(u => u.Projects)
                .HasForeignKey(p => p.OwnerId)
                .OnDelete(DeleteBehavior.Cascade); // If a user is deleted, delete their projects too
        });
        
        // Configure the Task entity
        // Using fully qualified name to avoid conflict with System.Threading.Tasks.Task
        modelBuilder.Entity<Models.Task>(entity =>
        {
            // Set up relationship with Project
            entity.HasOne(t => t.Project)
                .WithMany(p => p.Tasks)
                .HasForeignKey(t => t.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);
            
            // Set up relationship with TeamMember (assigned to)
            entity.HasOne(t => t.AssignedTo)
                .WithMany(tm => tm.AssignedTasks)
                .HasForeignKey(t => t.AssignedToId)
                .OnDelete(DeleteBehavior.SetNull); // Don't delete task if team member is removed
            
            // Set up relationship with User (created by)
            entity.HasOne(t => t.CreatedBy)
                .WithMany()
                .HasForeignKey(t => t.CreatedById)
                .OnDelete(DeleteBehavior.Restrict); // Don't allow deleting user if they created tasks
            
            // Set up relationship with Sprint
            entity.HasOne(t => t.Sprint)
                .WithMany(s => s.Tasks)
                .HasForeignKey(t => t.SprintId)
                .OnDelete(DeleteBehavior.SetNull); // Don't delete task if sprint is deleted
        });
        
        // Configure the TeamMember entity
        modelBuilder.Entity<TeamMember>(entity =>
        {
            // Set up relationship with Project
            entity.HasOne(tm => tm.Project)
                .WithMany(p => p.TeamMembers)
                .HasForeignKey(tm => tm.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);
            
            // Set up relationship with User
            entity.HasOne(tm => tm.User)
                .WithMany()
                .HasForeignKey(tm => tm.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            
            // Make email unique within a project
            entity.HasIndex(tm => new { tm.ProjectId, tm.Email }).IsUnique();
        });
        
        // Configure the Sprint entity
        modelBuilder.Entity<Sprint>(entity =>
        {
            // Set up relationship with Project
            entity.HasOne(s => s.Project)
                .WithMany(p => p.Sprints)
                .HasForeignKey(s => s.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);
        });
        
        // Configure the TaskComment entity
        modelBuilder.Entity<TaskComment>(entity =>
        {
            // Set up relationship with Task
            entity.HasOne(tc => tc.Task)
                .WithMany(t => t.Comments)
                .HasForeignKey(tc => tc.TaskId)
                .OnDelete(DeleteBehavior.Cascade);
            
            // Set up relationship with User (author)
            entity.HasOne(tc => tc.Author)
                .WithMany()
                .HasForeignKey(tc => tc.AuthorId)
                .OnDelete(DeleteBehavior.Restrict);
        });
        
        // Configure the TaskAttachment entity
        modelBuilder.Entity<TaskAttachment>(entity =>
        {
            // Set up relationship with Task
            entity.HasOne(ta => ta.Task)
                .WithMany(t => t.Attachments)
                .HasForeignKey(ta => ta.TaskId)
                .OnDelete(DeleteBehavior.Cascade);
            
            // Set up relationship with User (uploaded by)
            entity.HasOne(ta => ta.UploadedBy)
                .WithMany()
                .HasForeignKey(ta => ta.UploadedById)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
