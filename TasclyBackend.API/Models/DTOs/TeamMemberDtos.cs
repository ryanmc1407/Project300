namespace TasclyBackend.API.Models.DTOs;

public class AddTeamMemberDto
{
    public required string Email { get; set; }
    public required int ProjectId { get; set; }
    public required TeamRole Role { get; set; }
}
