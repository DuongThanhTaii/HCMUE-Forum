using UniHub.Identity.Application.Abstractions;
using UniHub.Identity.Domain.Roles;
using UniHub.Identity.Domain.Users;
using UniHub.Identity.Domain.Users.ValueObjects;
using UniHub.SharedKernel.CQRS;
using UniHub.SharedKernel.Results;

namespace UniHub.Identity.Application.Commands.Register;

/// <summary>
/// Handler for user registration command
/// </summary>
public sealed class RegisterUserCommandHandler : ICommandHandler<RegisterUserCommand, Guid>
{
    private readonly IUserRepository _userRepository;
    private readonly IRoleRepository _roleRepository;
    private readonly IPasswordHasher _passwordHasher;

    public RegisterUserCommandHandler(
        IUserRepository userRepository,
        IRoleRepository roleRepository,
        IPasswordHasher passwordHasher)
    {
        _userRepository = userRepository;
        _roleRepository = roleRepository;
        _passwordHasher = passwordHasher;
    }

    public async Task<Result<Guid>> Handle(RegisterUserCommand request, CancellationToken cancellationToken)
    {
        // Create email value object
        var emailResult = Email.Create(request.Email);
        if (emailResult.IsFailure)
        {
            return Result.Failure<Guid>(emailResult.Error);
        }

        // Check email uniqueness
        var isEmailUnique = await _userRepository.IsEmailUniqueAsync(emailResult.Value, cancellationToken);
        if (!isEmailUnique)
        {
            return Result.Failure<Guid>(UserErrors.EmailAlreadyExists);
        }

        // Split full name into first and last name
        var nameParts = request.FullName.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
        var firstName = nameParts.Length > 0 ? nameParts[0] : request.FullName;
        var lastName = nameParts.Length > 1 ? string.Join(' ', nameParts.Skip(1)) : string.Empty;

        // Create user profile
        var profileResult = UserProfile.Create(firstName, lastName, request.AvatarUrl, request.Bio);
        if (profileResult.IsFailure)
        {
            return Result.Failure<Guid>(profileResult.Error);
        }

        // Hash password
        var passwordHash = _passwordHasher.HashPassword(request.Password);

        // Create user
        var userResult = User.Create(emailResult.Value, passwordHash, profileResult.Value);
        if (userResult.IsFailure)
        {
            return Result.Failure<Guid>(userResult.Error);
        }

        var user = userResult.Value;

        // Assign default "Student" role
        var studentRole = await _roleRepository.GetByNameAsync("Student", cancellationToken);
        if (studentRole is not null)
        {
            user.AssignRole(studentRole.Id);
        }

        // Save user
        await _userRepository.AddAsync(user, cancellationToken);

        return Result.Success(user.Id.Value);
    }
}
