using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TicketDesk.Api.DTOs;
using TicketDesk.Api.Models;
using TicketDesk.Api.Services;

namespace TicketDesk.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]   // every action below requires a logged-in user
public class TicketsController : ControllerBase
{
    private readonly ITicketService _service;
    public TicketsController(ITicketService service) => _service = service;

    private int CurrentUserId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public ActionResult<List<TicketResponse>> GetAll() => Ok(_service.GetAll());

    [HttpGet("{id}")]
    public ActionResult<TicketResponse> GetById(int id)
    {
        var ticket = _service.GetById(id);
        return ticket is null ? NotFound() : Ok(ticket);   // 404 vs 200
    }

    [HttpPost]
    public ActionResult<TicketResponse> Create(CreateTicketRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Title))
            return BadRequest("Title is required.");        // 400

        var created = _service.Create(CurrentUserId, req);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created); // 201
    }

    [HttpPut("{id}/status")]
    [Authorize(Roles = "Agent,Admin")]   // only staff can resolve tickets
    public IActionResult UpdateStatus(int id, UpdateTicketStatusRequest req)
    {
        var ok = _service.UpdateStatus(id, req.Status);
        return ok ? NoContent() : NotFound();               // 204 vs 404
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public IActionResult Delete(int id)
    {
        var ok = _service.Delete(id);
        return ok ? NoContent() : NotFound();
    }
}