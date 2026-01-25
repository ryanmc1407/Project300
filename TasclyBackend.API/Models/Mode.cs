namespace TasclyBackend.API.Models;

// This represents the different modes in Tascly - Business Mode and Project Mode
// Business Mode is for managers to see high-level overview
// Project Mode is for detailed project work
public class Mode
{
    // Primary key
    public int Id { get; set; }
    
    // Name of the mode - "Business" or "Project"
    public required string Name { get; set; }
    
    // Description of what this mode is for
    public string? Description { get; set; }
    
    // Icon name for the UI
    public string? Icon { get; set; }
}
