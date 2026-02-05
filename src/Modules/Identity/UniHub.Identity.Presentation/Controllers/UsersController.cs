using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using UniHub.Identity.Application.Abstractions;
using UniHub.Identity.Application.Commands.Users.AssignBadge;
using UniHub.Identity.Application.Commands.Users.AssignRole;
using UniHub.Identity.Application.Commands.Users.RemoveBadge;
using UniHub.Identity.Application.Commands.Users.RemoveRole;
using UniHub.Identity.Domain.Users;
using UniHub.Identity.Presentation.DTOs.Users;

namespace UniHub.Identity.Presentation.Controllers;

[ApiController]
[Route("api/v1/users")]
[Produces("application/json")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly ISender _sender;
    private readonly IUserRepository _userRepository;

    public UsersController(ISender sender, IUserRepository userRepository)
    {
        _sender = sender;
        _userRepository = userRepository;
    }

    /// <summary>
    /// Get all users
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of users</returns>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<UserResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var users = await _userRepository.GetAllAsync(cancellationToken);
        var response = users.Select(MapToUserResponse);
        return Ok(response);
    }

    /// <summary>
    /// Get user by ID
    /// </summary>
    /// <param name="id">User ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>User information</returns>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(UserResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(new UserId(id), cancellationToken);
        
        if (user is null)
        {
            return NotFound(new { error = "User not found" });
        }

        return Ok(MapToUserResponse(user));
    }

    /// <summary>
    /// Get current user profile
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Current user information</returns>
    [HttpGet("me")]
    [ProducesResponseType(typeof(UserResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetMe(CancellationToken cancellationToken)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        
        if (userIdClaim is null || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new { error = "Invalid user token" });
        }

        var user = await _userRepository.GetByIdAsync(new UserId(userId), cancellationToken);
        
        if (user is null)
        {
            return NotFound(new { error = "User not found" });
        }

        return Ok(MapToUserResponse(user));
    }

    /// <summary>
    /// Update current user profile
    /// </summary>
    /// <param name="request">Profile update request</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success message</returns>
    [HttpPut("me/profile")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> UpdateProfile(
        [FromBody] UpdateProfileRequest request,
        CancellationToken cancellationToken)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        
        if (userIdClaim is null || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new { error = "Invalid user token" });
        }

        var user = await _userRepository.GetByIdAsync(new UserId(userId), cancellationToken);
        
        if (user is null)
        {
            return NotFound(new { error = "User not found" });
        }

        var profileResult = Domain.Users.ValueObjects.UserProfile.Create(
            request.FirstName,
            request.LastName,
            bio: request.Bio);

        if (profileResult.IsFailure)
        {
            return BadRequest(new { error = profileResult.Error.Message });
        }

        var updateResult = user.UpdateProfile(profileResult.Value);
        
        if (updateResult.IsFailure)
        {
            return BadRequest(new { error = updateResult.Error.Message });
        }

        await _userRepository.UpdateAsync(user, cancellationToken);

        return Ok(new { message = "Profile updated successfully" });
    }

    /// <summary>
    /// Assign role to user (Admin only)
    /// </summary>
    /// <param name="id">User ID</param>
    /// <param name="request">Role assignment request</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success message</returns>
    [HttpPost("{id:guid}/roles")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AssignRole(
        Guid id,
        [FromBody] AssignRoleRequest request,
        CancellationToken cancellationToken)
    {
        var command = new AssignRoleCommand(id, request.RoleId);
        var result = await _sender.Send(command, cancellationToken);

        if (result.IsFailure)
        {
            return BadRequest(new { error = result.Error.Message });
        }

        return Ok(new { message = "Role assigned successfully" });
    }

    /// <summary>
    /// Remove role from user (Admin only)
    /// </summary>
    /// <param name="id">User ID</param>
    /// <param name="roleId">Role ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success message</returns>
    [HttpDelete("{id:guid}/roles/{roleId:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RemoveRole(
        Guid id,
        Guid roleId,
        CancellationToken cancellationToken)
    {
        var command = new RemoveRoleCommand(id, roleId);
        var result = await _sender.Send(command, cancellationToken);

        if (result.IsFailure)
        {
            return BadRequest(new { error = result.Error.Message });
        }

        return Ok(new { message = "Role removed successfully" });
    }

    /// <summary>
    /// Assign official badge to user (Admin only)
    /// </summary>
    /// <param name="id">User ID</param>
    /// <param name="request">Badge assignment request</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success message</returns>
    [HttpPost("{id:guid}/badge")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> AssignBadge(
        Guid id,
        [FromBody] AssignBadgeRequest request,
        CancellationToken cancellationToken)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userIdClaim is null || !Guid.TryParse(userIdClaim, out var verifierId))
        {
            return Unauthorized(new { error = "Invalid user token" });
        }

        if (!Enum.TryParse<Domain.Users.ValueObjects.BadgeType>(request.BadgeType, ignoreCase: true, out var badgeType))
        {
            return BadRequest(new { error = "Invalid badge type. Valid values: Department, Club, BoardOfDirectors, Faculty, Company" });
        }

        var command = new AssignBadgeCommand(
            id,
            badgeType,
            request.BadgeName,
            verifierId.ToString(),
            request.Description);

        var result = await _sender.Send(command, cancellationToken);

        if (result.IsFailure)
        {
            return BadRequest(new { error = result.Error.Message });
        }

        return Ok(new { message = "Badge assigned successfully" });
    }

    /// <summary>
    /// Remove official badge from user (Admin only)
    /// </summary>
    /// <param name="id">User ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success message</returns>
    [HttpDelete("{id:guid}/badge")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RemoveBadge(
        Guid id,
        CancellationToken cancellationToken)
    {
        var command = new RemoveBadgeCommand(id);
        var result = await _sender.Send(command, cancellationToken);

        if (result.IsFailure)
        {
            return BadRequest(new { error = result.Error.Message });
        }

        return Ok(new { message = "Badge removed successfully" });
    }

    private static UserResponse MapToUserResponse(User user)
    {
        OfficialBadgeDto? badgeDto = null;
        if (user.Badge is not null)
        {
            badgeDto = new OfficialBadgeDto(
                user.Badge.Type.ToString(),
                user.Badge.Name,
                user.Badge.Description,
                user.Badge.DisplayText);
        }

        return new UserResponse(
            user.Id.Value,
            user.Email.Value,
            user.Profile.FullName,
            user.Profile.Bio,
            user.Status.ToString(),
            badgeDto,
            user.CreatedAt);
    }
}
