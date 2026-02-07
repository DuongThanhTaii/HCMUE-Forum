using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using UniHub.Learning.Application.Commands.CourseManagement;
using UniHub.Learning.Application.Commands.ModeratorAssignment;
using UniHub.Learning.Presentation.DTOs.Courses;

namespace UniHub.Learning.Presentation.Controllers;

[ApiController]
[Route("api/v1/courses")]
[Produces("application/json")]
public class CoursesController : ControllerBase
{
    private readonly ISender _sender;

    public CoursesController(ISender sender)
    {
        _sender = sender;
    }

    /// <summary>
    /// Create a new course
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(CreateCourseResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateCourse(
        [FromBody] CreateCourseRequest request,
        CancellationToken cancellationToken)
    {
        var command = new CreateCourseCommand(
            request.Code,
            request.Name,
            request.Description ?? string.Empty,
            request.Semester,
            request.Credits,
            request.CreatedBy,
            request.FacultyId);

        var result = await _sender.Send(command, cancellationToken);

        if (result.IsFailure)
        {
            return BadRequest(new { error = result.Error.Message });
        }

        var response = new CreateCourseResponse(result.Value, request.Code, request.Name);

        return CreatedAtAction(nameof(CreateCourse), new { id = response.CourseId }, response);
    }

    /// <summary>
    /// Update course information
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdateCourse(
        Guid id,
        [FromBody] UpdateCourseRequest request,
        CancellationToken cancellationToken)
    {
        var command = new UpdateCourseCommand(
            id,
            request.Name,
            request.Description ?? string.Empty,
            request.Semester,
            request.Credits);

        var result = await _sender.Send(command, cancellationToken);

        if (result.IsFailure)
        {
            return BadRequest(new { error = result.Error.Message });
        }

        return Ok(new { message = "Course updated successfully" });
    }

    /// <summary>
    /// Delete a course (soft delete)
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> DeleteCourse(
        Guid id,
        [FromBody] DeleteCourseRequest request,
        CancellationToken cancellationToken)
    {
        var command = new DeleteCourseCommand(id, request.DeletedBy);
        var result = await _sender.Send(command, cancellationToken);

        if (result.IsFailure)
        {
            return BadRequest(new { error = result.Error.Message });
        }

        return Ok(new { message = "Course deleted successfully" });
    }

    /// <summary>
    /// Assign a moderator to a course
    /// </summary>
    [HttpPost("{id}/moderators")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> AssignModerator(
        Guid id,
        [FromBody] AssignModeratorRequest request,
        CancellationToken cancellationToken)
    {
        var command = new AssignCourseModeratorCommand(id, request.ModeratorId, request.AssignedBy);
        var result = await _sender.Send(command, cancellationToken);

        if (result.IsFailure)
        {
            return BadRequest(new { error = result.Error.Message });
        }

        return Ok(new { message = "Moderator assigned successfully" });
    }

    /// <summary>
    /// Remove a moderator from a course
    /// </summary>
    [HttpDelete("{id}/moderators/{moderatorId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RemoveModerator(
        Guid id,
        Guid moderatorId,
        [FromBody] RemoveModeratorRequest request,
        CancellationToken cancellationToken)
    {
        var command = new RemoveCourseModeratorCommand(id, moderatorId, request.RemovedBy);
        var result = await _sender.Send(command, cancellationToken);

        if (result.IsFailure)
        {
            return BadRequest(new { error = result.Error.Message });
        }

        return Ok(new { message = "Moderator removed successfully" });
    }
}
