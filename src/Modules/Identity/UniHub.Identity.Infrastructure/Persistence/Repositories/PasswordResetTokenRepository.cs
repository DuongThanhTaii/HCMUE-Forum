using UniHub.Identity.Application.Abstractions;
using UniHub.Identity.Domain.Users;

namespace UniHub.Identity.Infrastructure.Persistence.Repositories;

/// <summary>
/// In-memory implementation of password reset token repository
/// TODO: Replace with proper database implementation when adding EF Core
/// </summary>
public sealed class PasswordResetTokenRepository : IPasswordResetTokenRepository
{
    private static readonly List<PasswordResetToken> _tokens = new();
    private static readonly object _lock = new();

    public Task<PasswordResetToken?> GetValidTokenAsync(string token, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            var resetToken = _tokens.FirstOrDefault(t => 
                t.Token == token && 
                t.IsValid());
            
            return Task.FromResult(resetToken);
        }
    }

    public Task AddAsync(PasswordResetToken resetToken, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            _tokens.Add(resetToken);
        }
        return Task.CompletedTask;
    }

    public Task UpdateAsync(PasswordResetToken resetToken, CancellationToken cancellationToken = default)
    {
        // In-memory implementation doesn't need explicit update as objects are mutable
        return Task.CompletedTask;
    }

    public Task InvalidateUserTokensAsync(UserId userId, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            var userTokens = _tokens.Where(t => t.UserId == userId && t.IsValid()).ToList();
            foreach (var token in userTokens)
            {
                token.MarkAsUsed();
            }
        }
        return Task.CompletedTask;
    }
}
