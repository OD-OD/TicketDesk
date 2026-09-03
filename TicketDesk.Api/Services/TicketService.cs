using Microsoft.EntityFrameworkCore;
using TicketDesk.Api.Data;
using TicketDesk.Api.DTOs;
using TicketDesk.Api.Models;

namespace TicketDesk.Api.Services;

public class TicketService : ITicketService
{
    private readonly AppDbContext _db;
    public TicketService(AppDbContext db) => _db = db;

    public List<TicketResponse> GetAll() =>
        _db.Tickets.Include(t => t.CreatedByUser)
            .Select(t => new TicketResponse(t.Id, t.Title, t.Description,
                t.Status, t.CreatedAt, t.CreatedByUser.Name))
            .ToList();

    public TicketResponse? GetById(int id)
    {
        var t = _db.Tickets.Include(x => x.CreatedByUser)
            .FirstOrDefault(x => x.Id == id);
        return t is null ? null
            : new TicketResponse(t.Id, t.Title, t.Description, t.Status, t.CreatedAt, t.CreatedByUser.Name);
    }

    public TicketResponse Create(int userId, CreateTicketRequest req)
    {
        var ticket = new Ticket
        {
            Title = req.Title,
            Description = req.Description,
            CreatedByUserId = userId
        };
        _db.Tickets.Add(ticket);
        _db.SaveChanges();
        var user = _db.Users.First(u => u.Id == userId);
        return new TicketResponse(ticket.Id, ticket.Title, ticket.Description,
            ticket.Status, ticket.CreatedAt, user.Name);
    }

    public bool UpdateStatus(int id, TicketStatus status)
    {
        var ticket = _db.Tickets.Find(id);
        if (ticket is null) return false;
        ticket.Status = status;
        _db.SaveChanges();
        return true;
    }

    public bool Delete(int id)
    {
        var ticket = _db.Tickets.Find(id);
        if (ticket is null) return false;
        _db.Tickets.Remove(ticket);
        _db.SaveChanges();
        return true;
    }
}