using TicketDesk.Api.DTOs;
using TicketDesk.Api.Models;

namespace TicketDesk.Api.Services;

public interface ITicketService
{
    List<TicketResponse> GetAll();
    TicketResponse? GetById(int id);
    TicketResponse Create(int userId, CreateTicketRequest req);
    bool UpdateStatus(int id, TicketStatus status);
    bool Delete(int id);
}