using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using TasclyBackend.API.Data;
using TasclyBackend.API.Models;
using TasclyBackend.API.Models.DTOs;

namespace TasclyBackend.API.Services;

// This is my authentication service - it handles all the login/register logic
// I'm using primary constructor (C# 12 feature) to inject dependencies
public class AuthService(ApplicationDbContext context, IConfiguration configuration) : IAuthService
{
    // These are automatically available because of the primary constructor
    // context = database access
    // configuration = appsettings.json values
    
    public async Task<AuthResponse?> RegisterAsync(RegisterDto registerDto)
    {
        // First, check if a user with this email already exists
        // I don't want duplicate emails in my database
        var existingUser = await context.Users
            .FirstOrDefaultAsync(u => u.Email == registerDto.Email);
        
        if (existingUser != null)
        {
            throw new Exception("User with this email already exists");
        }
        
        // Hash the password using BCrypt - NEVER store plain text passwords!
        // BCrypt automatically adds salt and is very secure
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password);
        
        // Create a new user object
        var user = new User
        {
            Username = registerDto.Username,
            Email = registerDto.Email,
            PasswordHash = passwordHash
        };
        
        // Add the user to the database and save changes
        context.Users.Add(user);
        await context.SaveChangesAsync();
        
        // Generate tokens for the new user
        var accessToken = GenerateAccessToken(user.Id, user.Email, user.Username);
        var refreshToken = GenerateRefreshToken();
        
        // Save the refresh token to the database so I can validate it later
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7); // Refresh token lasts 7 days
        await context.SaveChangesAsync();
        
        // Email sending via AWS Lambda is disabled (requires AWS credentials)
        
        // Return the response with both tokens
        return new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            Username = user.Username,
            Email = user.Email,
            UserId = user.Id
        };
    }
    
    public async Task<AuthResponse?> LoginAsync(LoginDto loginDto)
    {
        // Find the user by email
        var user = await context.Users
            .FirstOrDefaultAsync(u => u.Email == loginDto.Email);
        
        // If user doesn't exist, return null (invalid credentials)
        if (user == null)
        {
            return null;
        }
        
        // Verify the password using BCrypt
        // BCrypt.Verify compares the plain text password with the hashed one
        var isPasswordValid = BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash);
        
        if (!isPasswordValid)
        {
            return null; // Wrong password
        }
        
        // Password is correct! Generate new tokens
        var accessToken = GenerateAccessToken(user.Id, user.Email, user.Username);
        var refreshToken = GenerateRefreshToken();
        
        // Update the refresh token in the database
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
        await context.SaveChangesAsync();
        
        return new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            Username = user.Username,
            Email = user.Email,
            UserId = user.Id
        };
    }
    
    public async Task<AuthResponse?> RefreshTokenAsync(RefreshTokenDto refreshTokenDto)
    {
        // Find the user with this refresh token
        var user = await context.Users
            .FirstOrDefaultAsync(u => u.RefreshToken == refreshTokenDto.RefreshToken);
        
        // Check if the token exists and hasn't expired
        if (user == null || user.RefreshTokenExpiry < DateTime.UtcNow)
        {
            return null; // Invalid or expired refresh token
        }
        
        // Generate a new access token (and optionally a new refresh token)
        var accessToken = GenerateAccessToken(user.Id, user.Email, user.Username);
        var newRefreshToken = GenerateRefreshToken();
        
        // Update the refresh token
        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
        await context.SaveChangesAsync();
        
        return new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = newRefreshToken,
            Username = user.Username,
            Email = user.Email,
            UserId = user.Id
        };
    }
    
    public string GenerateAccessToken(int userId, string email, string username)
    {
        // Get the JWT secret key from appsettings.json
        var jwtKey = configuration["Jwt:Key"] 
            ?? throw new Exception("JWT Key not configured");
        
        // Create claims - these are pieces of information stored in the JWT
        // I can access these claims in my controllers to know who the user is
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Email, email),
            new Claim(ClaimTypes.Name, username),
            new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()) // Unique token ID
        };
        
        // Create the signing key from the secret
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        
        // Create the JWT token
        var token = new JwtSecurityToken(
            issuer: configuration["Jwt:Issuer"],
            audience: configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(15), // Access token expires in 15 minutes
            signingCredentials: credentials
        );
        
        // Convert the token to a string and return it
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
    
    public string GenerateRefreshToken()
    {
        // Generate a random refresh token using cryptographically secure random bytes
        var randomBytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        
        // Convert to base64 string
        return Convert.ToBase64String(randomBytes);
    }
}
