namespace TasclyBackend.API.Models;

// This is my User model - it represents a user in the database
// I'm using this to store user information like username, email, and password
public class User
{
    // Primary key - this uniquely identifies each user in the database
    public int Id { get; set; }
    
    // Username for the user - I'm making this required
    public required string Username { get; set; }
    
    // Email address - also required and should be unique
    public required string Email { get; set; }
    
    // Hashed password - NEVER store plain text passwords!
    // I'm using BCrypt to hash passwords before saving them
    public required string PasswordHash { get; set; }
    
    // Refresh token - this is used to get new access tokens without logging in again
    // It's nullable because a user might not have one yet
    public string? RefreshToken { get; set; }
    
    // When the refresh token expires - after this time, the user needs to log in again
    public DateTime? RefreshTokenExpiry { get; set; }
    
    // Navigation property - this links to all projects owned by this user
    // The virtual keyword helps with Entity Framework lazy loading
    public virtual ICollection<Project> Projects { get; set; } = new List<Project>();
}
