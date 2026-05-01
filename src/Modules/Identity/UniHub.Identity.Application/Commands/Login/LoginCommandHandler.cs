using UniHub.Identity.Application.Abstractions;
using UniHub.Identity.Domain.Users.ValueObjects;
using UniHub.SharedKernel.CQRS;
using UniHub.SharedKernel.Results;

namespace UniHub.Identity.Application.Commands.Login;

/// <summary>
/// Handler for user login command
/// </summary>
public sealed class LoginCommandHandler : ICommandHandler<LoginCommand, LoginResponse>
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtService _jwtService;
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly IRoleRepository _roleRepository;

    public LoginCommandHandler(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        IJwtService jwtService,
        IRefreshTokenRepository refreshTokenRepository,
        IRoleRepository roleRepository)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _jwtService = jwtService;
        _refreshTokenRepository = refreshTokenRepository;
        _roleRepository = roleRepository;
    }

    public async Task<Result<LoginResponse>> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        // Create email value object
        var emailResult = Email.Create(request.Email);
        if (emailResult.IsFailure)
        {
            return Result.Failure<LoginResponse>(LoginErrors.InvalidCredentials);
        }

        // Get user by email
        var user = await _userRepository.GetByEmailAsync(emailResult.Value, cancellationToken);
        if (user is null)
        {
            return Result.Failure<LoginResponse>(LoginErrors.InvalidCredentials);
        }

        // Verify password
        if (!_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            return Result.Failure<LoginResponse>(LoginErrors.InvalidCredentials);
        }

        // Check if user is active
        if (user.Status != Domain.Users.UserStatus.Active)
        {
            return Result.Failure<LoginResponse>(LoginErrors.UserNotActive);
        }

        // Resolve role names in a single query
        var roleIds = user.Roles.Select(ur => ur.RoleId);
        var roles = await _roleRepository.GetByIdsAsync(roleIds, cancellationToken);
        var roleNames = roles.Select(r => r.Name);

        // Generate JWT access token with role names
        var accessTokenResult = _jwtService.GenerateAccessToken(user, roleNames);
        if (accessTokenResult.IsFailure)
        {
            return Result.Failure<LoginResponse>(accessTokenResult.Error);
        }

        var accessToken = accessTokenResult.Value;
        var accessTokenExpiresAt = DateTime.UtcNow.Add(_jwtService.AccessTokenExpiry);

        // Generate refresh token
        var refreshToken = _jwtService.GenerateRefreshToken(user.Id);
        await _refreshTokenRepository.AddAsync(refreshToken, cancellationToken);

        var refreshTokenExpiresAt = DateTime.UtcNow.Add(_jwtService.RefreshTokenExpiry);

        return Result.Success(new LoginResponse(
            user.Id.Value,
            user.Email.Value,
            accessToken,
            refreshToken.Token,
            accessTokenExpiresAt,
            refreshTokenExpiresAt));
    }
}
