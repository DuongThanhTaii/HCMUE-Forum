using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using UniHub.Identity.Application.Abstractions;
using UniHub.Identity.Application.Commands.AssignScopedPermission;
using UniHub.Identity.Application.Commands.RemoveScopedPermission;
using UniHub.Identity.Application.Commands.Roles.CreateRole;
using UniHub.Identity.Application.Commands.Roles.DeleteRole;
using UniHub.Identity.Application.Commands.Roles.UpdateRole;
using UniHub.Identity.Domain.Roles;
using UniHub.Identity.Presentation.DTOs.Roles;

namespace UniHub.Identity.Presentation.Controllers;

[ApiController]
[Route("api/v1/roles")]
[Produces("application/json")]
[Authorize]
public class RolesController : ControllerBase
{
    private readonly ISender _sender;
    private readonly IRoleRepository _roleRepository;

    public RolesController(ISender sender, IRoleRepository roleRepository)
    {
        _sender = sender;
        _roleRepository = roleRepository;
    }

    /// <summary>
    /// Get all roles
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of roles</returns>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<RoleResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var roles = await _roleRepository.GetAllAsync(cancellationToken);
        var response = roles.Select(MapToRoleResponse);
        return Ok(response);
    }

    /// <summary>
    /// Get role by ID
    /// </summary>
    /// <param name="id">Role ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Role information</returns>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(RoleResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var role = await _roleRepository.GetByIdAsync(new RoleId(id), cancellationToken);
        
        if (role is null)
        {
            return NotFound(new { error = "Role not found" });
        }

        return Ok(MapToRoleResponse(role));
    }

    /// <summary>
    /// Create a new role (Admin only)
    /// </summary>
    /// <param name="request">Role creation request</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Created role information</returns>
    [HttpPost]
    [ProducesResponseType(typeof(RoleResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create(
        [FromBody] CreateRoleRequest request,
        CancellationToken cancellationToken)
    {
        var command = new CreateRoleCommand(request.Name, request.Description);
        var result = await _sender.Send(command, cancellationToken);

        if (result.IsFailure)
        {
            return BadRequest(new { error = result.Error.Message });
        }

        var response = MapToRoleResponse(result.Value);
        return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
    }

    /// <summary>
    /// Update an existing role (Admin only)
    /// </summary>
    /// <param name="id">Role ID</param>
    /// <param name="request">Role update request</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success message</returns>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(
        Guid id,
        [FromBody] UpdateRoleRequest request,
        CancellationToken cancellationToken)
    {
        var command = new UpdateRoleCommand(id, request.Name, request.Description);
        var result = await _sender.Send(command, cancellationToken);

        if (result.IsFailure)
        {
            return BadRequest(new { error = result.Error.Message });
        }

        return Ok(new { message = "Role updated successfully" });
    }

    /// <summary>
    /// Delete a role (Admin only)
    /// </summary>
    /// <param name="id">Role ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success message</returns>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var command = new DeleteRoleCommand(id);
        var result = await _sender.Send(command, cancellationToken);

        if (result.IsFailure)
        {
            return BadRequest(new { error = result.Error.Message });
        }

        return Ok(new { message = "Role deleted successfully" });
    }

    /// <summary>
    /// Assign permission to role (Admin only)
    /// </summary>
    /// <param name="id">Role ID</param>
    /// <param name="request">Permission assignment request</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success message</returns>
    [HttpPost("{id:guid}/permissions")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> AssignPermission(
        Guid id,
        [FromBody] AssignPermissionRequest request,
        CancellationToken cancellationToken)
    {
        var command = new AssignScopedPermissionCommand(
            id,
            request.PermissionId,
            request.ScopeType,
            request.ScopeValue);

        var result = await _sender.Send(command, cancellationToken);

        if (result.IsFailure)
        {
            return BadRequest(new { error = result.Error.Message });
        }

        return Ok(new { message = "Permission assigned successfully" });
    }

    /// <summary>
    /// Remove permission from role (Admin only)
    /// </summary>
    /// <param name="id">Role ID</param>
    /// <param name="permissionId">Permission ID</param>
    /// <param name="scopeType">Scope type</param>
    /// <param name="scopeValue">Scope value (optional)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success message</returns>
    [HttpDelete("{id:guid}/permissions/{permissionId:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RemovePermission(
        Guid id,
        Guid permissionId,
        [FromQuery] string scopeType,
        [FromQuery] string? scopeValue,
        CancellationToken cancellationToken)
    {
        var command = new RemoveScopedPermissionCommand(
            id,
            permissionId,
            scopeType,
            scopeValue);

        var result = await _sender.Send(command, cancellationToken);

        if (result.IsFailure)
        {
            return BadRequest(new { error = result.Error.Message });
        }

        return Ok(new { message = "Permission removed successfully" });
    }

    private static RoleResponse MapToRoleResponse(Role role)
    {
        return new RoleResponse(
            role.Id.Value,
            role.Name,
            role.Description,
            role.IsDefault,
            role.IsSystemRole,
            role.Permissions.Count,
            role.CreatedAt);
    }
}
