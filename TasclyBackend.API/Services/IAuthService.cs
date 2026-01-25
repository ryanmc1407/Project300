using TasclyBackend.API.Models.DTOs;

namespace TasclyBackend.API.Services;

// This interface defines what my AuthService should be able to do
// Using interfaces is good practice - it makes testing easier and follows SOLID principles
public interface IAuthService
{
    // Register a new user - returns the auth response with tokens
    Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto);
    
    // Log in an existing user - returns tokens if credentials are valid
    Task<AuthResponseDto?> LoginAsync(LoginDto loginDto);
    
    // Refresh the access token using a refresh token
    Task<AuthResponseDto?> RefreshTokenAsync(string refreshToken);
    
    // Generate a JWT access token for a user
    string GenerateAccessToken(int userId, string email, string username);
    
    // Generate a refresh token (random string)
    string GenerateRefreshToken();
}
