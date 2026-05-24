using Neotech.Domain.Entities;
using System.Security.Claims;

namespace Neotech.Application.Services;

public interface IJwtService
{
    string GenerateToken(User user);
    string GenerateRefreshToken();
    ClaimsPrincipal? ValidateToken(string token);
    DateTime GetTokenExpiry();
}
