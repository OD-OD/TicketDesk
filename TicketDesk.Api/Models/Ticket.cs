namespace TicketDesk.Api.Models;

public enum TicketStatus { Open, InProgress, Resolved }

public class Ticket
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public string Description { get; set; } = "";
    public TicketStatus Status { get; set; } = TicketStatus.Open;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public int CreatedByUserId { get; set; }
    public User CreatedByUser { get; set; } = null!;
    public int? AssignedAgentId { get; set; }
    public User? AssignedAgent { get; set; }
}