using Microsoft.AspNetCore.Mvc;
using TicketDesk.Api.Data;
using TicketDesk.Api.DTOs;
using TicketDesk.Api.Models;
using TicketDesk.Api.Services;

namespace TicketDesk.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly TokenService _tokenService;

    public AuthController(AppDbContext db, TokenService tokenService)
    {
        _db = db;
        _tokenService = tokenService;
    }

    [HttpPost("register")]
    public IActionResult Register(RegisterRequest req)
    {
        if (_db.Users.Any(u => u.Email == req.Email))
            return BadRequest("Email already registered.");

        var user = new User
        {
            Name = req.Name,
            Email = req.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
            Role = UserRole.Customer
        };
        _db.Users.Add(user);
        _db.SaveChanges();

        var token = _tokenService.CreateToken(user);
        return Ok(new AuthResponse(token, user.Name, user.Email, user.Role.ToString()));
    }


    [HttpPost("login")]
    public IActionResult Login(LoginRequest req)
    {
        var user = _db.Users.FirstOrDefault(u => u.Email == req.Email);
        if (user is null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
            return Unauthorized("Invalid email or password.");   // 401

        var token = _tokenService.CreateToken(user);
        return Ok(new AuthResponse(token, user.Name, user.Email, user.Role.ToString()));
    }
}