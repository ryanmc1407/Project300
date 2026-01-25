using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using TasclyBackend.API.Data;
using TasclyBackend.API.Services;
using TasclyBackend.API.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container

// Configure Entity Framework Core with SQLite
// I'm using SQLite because it's easy to set up and doesn't require a separate database server
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Register my custom services for dependency injection
// Scoped means a new instance is created for each HTTP request
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IProjectService, ProjectService>();

// I'm registering the AI services I created
// This allows them to be injected into my controllers
builder.Services.AddScoped<ITaskBulkRepository, TaskBulkRepository>();
builder.Services.AddScoped<ITeamMemberRepository, TeamMemberRepository>(); 

// I'm registering AiTaskService with HttpClient to communicate with xAI
builder.Services.AddHttpClient<IAiTaskService, AiTaskService>();

// Configure JWT Authentication
// This tells ASP.NET Core how to validate JWT tokens
builder.Services.AddAuthentication(options =>
{
    // Set JWT Bearer as the default authentication scheme
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    // Configure how to validate the JWT token
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true, // Check if the token was issued by my server
        ValidateAudience = true, // Check if the token is for my application
        ValidateLifetime = true, // Check if the token hasn't expired
        ValidateIssuerSigningKey = true, // Verify the token's signature
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] 
                ?? throw new Exception("JWT Key not configured")))
    };
});

// Add authorization services
builder.Services.AddAuthorization();

// Add controllers
builder.Services.AddControllers();

// Configure CORS to allow requests from the Angular frontend
// CORS = Cross-Origin Resource Sharing
// Configure CORS to allow requests from the Angular frontend
// CORS = Cross-Origin Resource Sharing
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
    {
        policy.SetIsOriginAllowed(origin => true) // Allow any origin for development
              .AllowAnyHeader() // Allow any HTTP headers
              .AllowAnyMethod() // Allow GET, POST, PUT, DELETE, etc.
              .AllowCredentials(); // Allow cookies/credentials
    });
});

// Add Swagger/OpenAPI for API documentation
// This creates a nice UI to test my API endpoints
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline

// Use Swagger in development mode
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Redirect HTTP to HTTPS for security
app.UseHttpsRedirection();

// Enable CORS - this must come before authentication!
app.UseCors("AllowAngularApp");

// Enable authentication - this checks the JWT token
app.UseAuthentication();

// Enable authorization - this checks if the user has permission
app.UseAuthorization();

// Map controller endpoints
app.MapControllers();

app.Run();
