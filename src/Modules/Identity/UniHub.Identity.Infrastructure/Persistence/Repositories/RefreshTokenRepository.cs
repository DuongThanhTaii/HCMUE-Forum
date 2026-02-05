using Microsoft.EntityFrameworkCore;
using UniHub.Identity.Application.Abstractions;
using UniHub.Identity.Domain.Tokens;
using UniHub.Identity.Domain.Users;

namespace UniHub.Identity.Infrastructure.Persistence.Repositories;

/// <summary>
/// In-memory implementation of refresh token repository
/// TODO: Replace with proper database implementation when adding EF Core
/// </summary>
public sealed class RefreshTokenRepository : IRefreshTokenRepository
{
    private static readonly List<RefreshToken> _tokens = new();
    private static readonly object _lock = new();

    public Task<RefreshToken?> GetByTokenAsync(string token, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            var refreshToken = _tokens.FirstOrDefault(t => t.Token == token);
            return Task.FromResult(refreshToken);
        }
    }

    public Task<List<RefreshToken>> GetActiveTokensByUserIdAsync(UserId userId, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            var activeTokens = _tokens
                .Where(t => t.UserId == userId && t.IsActive)
                .ToList();
            return Task.FromResult(activeTokens);
        }
    }

    public Task AddAsync(RefreshToken refreshToken, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            _tokens.Add(refreshToken);
        }
        return Task.CompletedTask;
    }

    public Task UpdateAsync(RefreshToken refreshToken, CancellationToken cancellationToken = default)
    {
        // In-memory implementation doesn't need explicit update as objects are mutable
        return Task.CompletedTask;
    }

    public Task RevokeAllByUserIdAsync(UserId userId, string? revokedByIp = null, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            var userTokens = _tokens.Where(t => t.UserId == userId && t.IsActive).ToList();
            foreach (var token in userTokens)
            {
                token.Revoke(revokedByIp, "Revoked all tokens");
            }
        }
        return Task.CompletedTask;
    }

    public Task RemoveExpiredTokensAsync(CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            _tokens.RemoveAll(t => t.IsExpired);
        }
        return Task.CompletedTask;
    }
}
