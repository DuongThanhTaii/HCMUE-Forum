using UniHub.Identity.Domain.Users;
using UniHub.SharedKernel.Domain;

namespace UniHub.Identity.Domain.Tokens;

public sealed class RefreshToken : Entity<RefreshTokenId>
{
    public string Token { get; private set; }
    public DateTime ExpiryTime { get; private set; }
    public bool IsExpired => DateTime.UtcNow >= ExpiryTime;
    public DateTime CreatedAt { get; private set; }
    public string? RevokedBy { get; private set; }
    public DateTime? RevokedAt { get; private set; }
    public bool IsActive => RevokedAt == null && !IsExpired;
    public string? ReplacedByToken { get; private set; }
    public UserId UserId { get; private set; }

    private RefreshToken()
    {
        // EF Core constructor
        Token = string.Empty;
        UserId = null!;
    }

    internal RefreshToken(UserId userId, string token, DateTime expiryTime)
    {
        Id = RefreshTokenId.CreateUnique();
        UserId = userId;
        Token = token;
        ExpiryTime = expiryTime;
        CreatedAt = DateTime.UtcNow;
    }

    public void Revoke(string? replacedByToken = null, string? revokedBy = null)
    {
        RevokedAt = DateTime.UtcNow;
        RevokedBy = revokedBy;
        ReplacedByToken = replacedByToken;
    }
}