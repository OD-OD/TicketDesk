using TicketDesk.Api.Models;

namespace TicketDesk.Api.DTOs;

public record CreateTicketRequest(string Title, string Description);
public record UpdateTicketStatusRequest(TicketStatus Status);
public record TicketResponse(int Id, string Title, string Description,
    TicketStatus Status, DateTime CreatedAt, string CreatedByName);