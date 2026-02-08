namespace TasclyBackend.API.Models.DTOs;

// DTOs (Data Transfer Objects) are used to transfer data between the frontend and backend
// They're different from the database models because we don't want to expose everything

// This is what the frontend sends when a user wants to register
public class RegisterDto
{
    public required string Username { get; set; }
    public required string Email { get; set; }
    public required string Password { get; set; }
}

// This is what the frontend sends when a user wants to log in
public class LoginDto
{
    public required string Email { get; set; }
    public required string Password { get; set; }
}

// This is what I send back to the frontend after successful login/register
// It contains both tokens needed for authentication
public class AuthResponse
{
    public required string AccessToken { get; set; }
    public required string RefreshToken { get; set; }
    public required string Username { get; set; }
    public required string Email { get; set; }
    public required int UserId { get; set; } // Add user ID to response
}

// This is what the frontend sends when it wants to refresh the access token
public class RefreshTokenDto
{
    public required string RefreshToken { get; set; }
}

// This is what the frontend sends when creating a new project
public class CreateProjectDto
{
    public required string Name { get; set; }
    public string? Description { get; set; }
}

// This is what I send back to the frontend when returning project data
public class ProjectDto
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public int OwnerId { get; set; }
    public DateTime CreatedAt { get; set; }
    public string UserRole { get; set; } = "Viewer"; // Default role
}
