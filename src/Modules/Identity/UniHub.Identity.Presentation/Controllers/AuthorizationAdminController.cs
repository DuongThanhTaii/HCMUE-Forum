using MediatR;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using UniHub.Contracts;
using UniHub.Identity.Application.Authorization;
using UniHub.Identity.Application.Commands.Authorization.RevokeGroupPermissionOverride;
using UniHub.Identity.Application.Commands.Authorization.RevokeUserPermissionOverride;
using UniHub.Identity.Application.Commands.Authorization.SetEndpointToggle;
using UniHub.Identity.Application.Commands.Authorization.UpsertGroupPermissionOverride;
using UniHub.Identity.Application.Commands.Authorization.UpsertUserPermissionOverride;
using UniHub.Identity.Application.Queries.Authorization.GetAuthorizationAuditLogs;
using UniHub.Identity.Application.Queries.Authorization.GetEndpointToggleByKey;
using UniHub.Identity.Application.Queries.Authorization.GetEndpointToggles;
using UniHub.Identity.Application.Queries.Authorization.GetGroupPermissionOverrides;
using UniHub.Identity.Application.Queries.Authorization.GetUserPermissionOverrides;
using UniHub.Identity.Presentation.DTOs.Authorization;

namespace UniHub.Identity.Presentation.Controllers;

[Route("api/v1/admin/authorization")]
[Produces("application/json")]
[Authorize(Roles = "Admin")]
public sealed class AuthorizationAdminController : BaseApiController
{
    private readonly ISender _sender;

    public AuthorizationAdminController(ISender sender)
    {
        _sender = sender;
    }

    [HttpGet("users/{userId:guid}/overrides")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<PermissionOverrideResponse>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetUserOverrides(Guid userId, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetUserPermissionOverridesQuery(userId), cancellationToken);
        if (result.IsFailure)
        {
            return NotFound(ApiResponses.Failure(result.Error.Message));
        }

        IReadOnlyList<PermissionOverrideResponse> response = result.Value.Select(MapToResponse).ToList();
        return Ok(ApiResponses.Success(response));
    }

    [HttpPost("users/{userId:guid}/overrides")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpsertUserOverride(
        Guid userId,
        [FromBody] UpsertPermissionOverrideRequest request,
        CancellationToken cancellationToken)
    {
        var command = new UpsertUserPermissionOverrideCommand(
            userId,
            request.PermissionId,
            request.ScopeType,
            request.ScopeValue,
            request.Effect,
            request.Reason,
            request.ExpiresAtUtc);

        var result = await _sender.Send(command, cancellationToken);
        if (result.IsFailure)
        {
            return BadRequest(ApiResponses.Failure(result.Error.Message));
        }

        return Ok(ApiResponses.Success("User permission override upserted successfully"));
    }

    [HttpDelete("users/{userId:guid}/overrides")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RevokeUserOverride(
        Guid userId,
        [FromQuery] Guid permissionId,
        [FromQuery] string scopeType,
        [FromQuery] string? scopeValue,
        CancellationToken cancellationToken)
    {
        var command = new RevokeUserPermissionOverrideCommand(userId, permissionId, scopeType, scopeValue);
        var result = await _sender.Send(command, cancellationToken);

        if (result.IsFailure)
        {
            return BadRequest(ApiResponses.Failure(result.Error.Message));
        }

        return Ok(ApiResponses.Success("User permission override revoked successfully"));
    }

    [HttpGet("groups/{groupId:guid}/overrides")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<PermissionOverrideResponse>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetGroupOverrides(Guid groupId, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetGroupPermissionOverridesQuery(groupId), cancellationToken);
        if (result.IsFailure)
        {
            return NotFound(ApiResponses.Failure(result.Error.Message));
        }

        IReadOnlyList<PermissionOverrideResponse> response = result.Value.Select(MapToResponse).ToList();
        return Ok(ApiResponses.Success(response));
    }

    [HttpPost("groups/{groupId:guid}/overrides")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpsertGroupOverride(
        Guid groupId,
        [FromBody] UpsertPermissionOverrideRequest request,
        CancellationToken cancellationToken)
    {
        var command = new UpsertGroupPermissionOverrideCommand(
            groupId,
            request.PermissionId,
            request.ScopeType,
            request.ScopeValue,
            request.Effect,
            request.Reason,
            request.ExpiresAtUtc);

        var result = await _sender.Send(command, cancellationToken);
        if (result.IsFailure)
        {
            return BadRequest(ApiResponses.Failure(result.Error.Message));
        }

        return Ok(ApiResponses.Success("Group permission override upserted successfully"));
    }

    [HttpDelete("groups/{groupId:guid}/overrides")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RevokeGroupOverride(
        Guid groupId,
        [FromQuery] Guid permissionId,
        [FromQuery] string scopeType,
        [FromQuery] string? scopeValue,
        CancellationToken cancellationToken)
    {
        var command = new RevokeGroupPermissionOverrideCommand(groupId, permissionId, scopeType, scopeValue);
        var result = await _sender.Send(command, cancellationToken);

        if (result.IsFailure)
        {
            return BadRequest(ApiResponses.Failure(result.Error.Message));
        }

        return Ok(ApiResponses.Success("Group permission override revoked successfully"));
    }

    [HttpGet("toggles")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<EndpointToggleResponse>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetEndpointToggles(CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetEndpointTogglesQuery(), cancellationToken);
        if (result.IsFailure)
        {
            return BadRequest(ApiResponses.Failure(result.Error.Message));
        }

        IReadOnlyList<EndpointToggleResponse> response = result.Value.Select(MapEndpointToggleToResponse).ToList();
        return Ok(ApiResponses.Success(response));
    }

    [HttpGet("toggles/{endpointKey}")]
    [ProducesResponseType(typeof(ApiResponse<EndpointToggleResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetEndpointToggleByKey(string endpointKey, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetEndpointToggleByKeyQuery(endpointKey), cancellationToken);
        if (result.IsFailure)
        {
            return NotFound(ApiResponses.Failure(result.Error.Message));
        }

        return Ok(ApiResponses.Success(MapEndpointToggleToResponse(result.Value)));
    }

    [HttpPut("toggles/{endpointKey}")]
    [ProducesResponseType(typeof(ApiResponse<EndpointToggleResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SetEndpointToggle(
        string endpointKey,
        [FromBody] SetEndpointToggleRequest request,
        CancellationToken cancellationToken)
    {
        var command = new SetEndpointToggleCommand(
            endpointKey,
            request.IsEnabled,
            GetActorIdentifier(),
            request.Reason);

        var result = await _sender.Send(command, cancellationToken);
        if (result.IsFailure)
        {
            return BadRequest(ApiResponses.Failure(result.Error.Message));
        }

        return Ok(ApiResponses.Success(MapEndpointToggleToResponse(result.Value)));
    }

    [HttpGet("audit-logs")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<AuthorizationAuditLogResponse>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAuthorizationAuditLogs(
        [FromQuery] Guid? userId,
        [FromQuery] string? endpointKey,
        [FromQuery] bool? isSuccess,
        [FromQuery] DateTime? fromUtc,
        [FromQuery] DateTime? toUtc,
        [FromQuery] int take = 100,
        CancellationToken cancellationToken = default)
    {
        var query = new GetAuthorizationAuditLogsQuery(
            userId,
            endpointKey,
            isSuccess,
            fromUtc,
            toUtc,
            take);

        var result = await _sender.Send(query, cancellationToken);
        if (result.IsFailure)
        {
            return BadRequest(ApiResponses.Failure(result.Error.Message));
        }

        IReadOnlyList<AuthorizationAuditLogResponse> response = result.Value.Select(MapAuditLogToResponse).ToList();
        return Ok(ApiResponses.Success(response));
    }

    private static PermissionOverrideResponse MapToResponse(PermissionOverrideItemResponse item)
    {
        return new PermissionOverrideResponse(
            item.OverrideId,
            item.PermissionId,
            item.PermissionCode,
            item.ScopeType,
            item.ScopeValue,
            item.Effect,
            item.Reason,
            item.ExpiresAtUtc,
            item.CreatedAtUtc,
            item.UpdatedAtUtc,
            item.IsRevoked);
    }

    private static EndpointToggleResponse MapEndpointToggleToResponse(EndpointToggleItemResponse item)
    {
        return new EndpointToggleResponse(
            item.EndpointKey,
            item.IsEnabled,
            item.Reason,
            item.UpdatedBy,
            item.UpdatedAtUtc,
            item.Version);
    }

    private static AuthorizationAuditLogResponse MapAuditLogToResponse(AuthorizationAuditLogItemResponse item)
    {
        return new AuthorizationAuditLogResponse(
            item.AuditLogId,
            item.ActorUserId,
            item.Action,
            item.TargetType,
            item.TargetKey,
            item.IsSuccess,
            item.Detail,
            item.OccurredAtUtc);
    }

    private string GetActorIdentifier()
    {
        return User?.FindFirst("sub")?.Value
               ?? User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
               ?? User?.Identity?.Name
               ?? "system";
    }
}
