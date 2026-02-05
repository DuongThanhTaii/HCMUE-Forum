using UniHub.Identity.Domain.Users;
using UniHub.SharedKernel.Results;

namespace UniHub.Identity.Application.Abstractions;

/// <summary>
/// JWT token service interface for generating and validating JWT tokens
/// </summary>
public interface IJwtService
{
    /// <summary>
    /// Generates a JWT access token for the specified user
    /// </summary>
    /// <param name="user">The user to generate token for</param>
    /// <returns>JWT token string</returns>
    Result<string> GenerateAccessToken(User user);

    /// <summary>
    /// Validates a JWT token and returns the user ID if valid
    /// </summary>
    /// <param name="token">JWT token to validate</param>
    /// <returns>User ID if token is valid</returns>
    Result<UserId> ValidateToken(string token);

    /// <summary>
    /// Gets the expiration time for access tokens (15 minutes)
    /// </summary>
    TimeSpan AccessTokenExpiry { get; }
}