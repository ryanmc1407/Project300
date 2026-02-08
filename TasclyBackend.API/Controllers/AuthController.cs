using Microsoft.AspNetCore.Mvc;
using TasclyBackend.API.Models.DTOs;
using TasclyBackend.API.Services;

namespace TasclyBackend.API.Controllers;

// This is my authentication controller - handles login, register, and refresh token
// [ApiController] adds automatic model validation and better error responses
// [Route] sets the base URL to /api/auth
[ApiController]
[Route("api/[controller]")]
public class AuthController(IAuthService authService) : ControllerBase
{
    // Using primary constructor to inject IAuthService
    // This is cleaner than the old constructor syntax
    
    // POST /api/auth/register
    // This endpoint lets new users create an account
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
    {
        try
        {
            // Call the auth service to register the user
            var response = await authService.RegisterAsync(registerDto);
            
            // Return 200 OK with the tokens
            return Ok(response);
        }
        catch (Exception ex)
        {
            // If something goes wrong (like duplicate email), return 400 Bad Request
            return BadRequest(new { message = ex.Message });
        }
    }
    
    // POST /api/auth/login
    // This endpoint lets existing users log in
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
    {
        // Try to log in the user
        var response = await authService.LoginAsync(loginDto);
        
        // If response is null, the credentials were invalid
        if (response == null)
        {
            return Unauthorized(new { message = "Invalid email or password" });
        }
        
        // Return the tokens
        return Ok(response);
    }
    
    // POST /api/auth/refresh
    // This endpoint lets the frontend get a new access token without logging in again
    // This is called when the access token expires but the refresh token is still valid
    [HttpPost("refresh")]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenDto refreshTokenDto)
    {
        // Try to refresh the token
        var response = await authService.RefreshTokenAsync(refreshTokenDto);
        
        // If response is null, the refresh token was invalid or expired
        if (response == null)
        {
            return Unauthorized(new { message = "Invalid or expired refresh token" });
        }
        
        // Return the new tokens
        return Ok(response);
    }
}
