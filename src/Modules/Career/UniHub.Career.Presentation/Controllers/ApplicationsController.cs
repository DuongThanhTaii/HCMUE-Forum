using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using UniHub.Career.Application.Commands.Applications.AcceptApplication;
using UniHub.Career.Application.Commands.Applications.RejectApplication;
using UniHub.Career.Application.Commands.Applications.SubmitApplication;
using UniHub.Career.Application.Commands.Applications.UpdateApplicationStatus;
using UniHub.Career.Application.Commands.Applications.WithdrawApplication;
using UniHub.Career.Application.Queries.Applications.GetApplicationById;
using UniHub.Career.Application.Queries.Applications.GetApplicationsByApplicant;
using UniHub.Career.Application.Queries.Applications.GetApplicationsByJob;

namespace UniHub.Career.Presentation.Controllers;

/// <summary>
/// Controller for managing job applications
/// </summary>
[ApiController]
[Route("api/v1/applications")]
[Authorize]
public class ApplicationsController : ControllerBase
{
    private readonly ISender _sender;

    public ApplicationsController(ISender sender)
    {
        _sender = sender;
    }

    /// <summary>
    /// Submit a new job application
    /// </summary>
    /// <param name="command">Application submission details</param>
    /// <returns>The created application</returns>
    [HttpPost]
    [ProducesResponseType(typeof(ApplicationResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(object), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SubmitApplication([FromBody] SubmitApplicationCommand command)
    {
        var result = await _sender.Send(command);

        if (result.IsFailure)
        {
            return BadRequest(new { error = result.Error.Message });
        }

        return CreatedAtAction(
            nameof(GetApplicationById),
            new { id = result.Value.Id },
            result.Value);
    }

    /// <summary>
    /// Get all applications for the current user (as applicant)
    /// </summary>
    /// <param name="page">Page number</param>
    /// <param name="pageSize">Page size</param>
    /// <returns>List of user's applications</returns>
    [HttpGet]
    [ProducesResponseType(typeof(ApplicationListResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(object), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetMyApplications(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        // In a real application, get userId from ClaimsPrincipal
        // For now, this would need to be passed or extracted from auth context
        var query = new GetApplicationsByApplicantQuery(
            ApplicantId: Guid.Empty, // TODO: Get from authenticated user
            Status: null,
            Page: page,
            PageSize: pageSize);

        var result = await _sender.Send(query);

        if (result.IsFailure)
        {
            return BadRequest(new { error = result.Error.Message });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Get a specific application by ID
    /// </summary>
    /// <param name="id">Application ID</param>
    /// <returns>Application details</returns>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApplicationResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(object), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(object), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetApplicationById(Guid id)
    {
        var query = new GetApplicationByIdQuery(id);

        var result = await _sender.Send(query);

        if (result.IsFailure)
        {
            return NotFound(new { error = result.Error.Message });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Update the status of an application (recruiter action)
    /// </summary>
    /// <param name="id">Application ID</param>
    /// <param name="command">Status update details</param>
    /// <returns>Success message</returns>
    [HttpPut("{id:guid}/status")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(object), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(object), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateApplicationStatus(Guid id, [FromBody] UpdateApplicationStatusCommand command)
    {
        if (id != command.ApplicationId)
        {
            return BadRequest(new { error = "Application ID in route does not match the one in request body" });
        }

        var result = await _sender.Send(command);

        if (result.IsFailure)
        {
            return NotFound(new { error = result.Error.Message });
        }

        return Ok(new { message = "Application status updated successfully" });
    }

    /// <summary>
    /// Withdraw an application (applicant action)
    /// </summary>
    /// <param name="id">Application ID</param>
    /// <param name="command">Withdrawal details</param>
    /// <returns>Success message</returns>
    [HttpPost("{id:guid}/withdraw")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(object), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(object), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> WithdrawApplication(Guid id, [FromBody] WithdrawApplicationCommand command)
    {
        if (id != command.ApplicationId)
        {
            return BadRequest(new { error = "Application ID in route does not match the one in request body" });
        }

        var result = await _sender.Send(command);

        if (result.IsFailure)
        {
            return NotFound(new { error = result.Error.Message });
        }

        return Ok(new { message = "Application withdrawn successfully" });
    }

    /// <summary>
    /// Accept a job offer (applicant action)
    /// </summary>
    /// <param name="id">Application ID</param>
    /// <param name="command">Acceptance details</param>
    /// <returns>Success message</returns>
    [HttpPost("{id:guid}/accept")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(object), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(object), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AcceptApplication(Guid id, [FromBody] AcceptApplicationCommand command)
    {
        if (id != command.ApplicationId)
        {
            return BadRequest(new { error = "Application ID in route does not match the one in request body" });
        }

        var result = await _sender.Send(command);

        if (result.IsFailure)
        {
            return NotFound(new { error = result.Error.Message });
        }

        return Ok(new { message = "Job offer accepted successfully" });
    }

    /// <summary>
    /// Reject an application (recruiter action)
    /// </summary>
    /// <param name="id">Application ID</param>
    /// <param name="command">Rejection details</param>
    /// <returns>Success message</returns>
    [HttpPost("{id:guid}/reject")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(object), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(object), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RejectApplication(Guid id, [FromBody] RejectApplicationCommand command)
    {
        if (id != command.ApplicationId)
        {
            return BadRequest(new { error = "Application ID in route does not match the one in request body" });
        }

        var result = await _sender.Send(command);

        if (result.IsFailure)
        {
            return NotFound(new { error = result.Error.Message });
        }

        return Ok(new { message = "Application rejected successfully" });
    }

    /// <summary>
    /// Get all applications for a specific job posting (recruiter action)
    /// </summary>
    /// <param name="jobId">Job posting ID</param>
    /// <param name="page">Page number</param>
    /// <param name="pageSize">Page size</param>
    /// <returns>List of applications for the job</returns>
    [HttpGet("jobs/{jobId:guid}")]
    [ProducesResponseType(typeof(ApplicationListResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(object), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetApplicationsByJob(
        Guid jobId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = new GetApplicationsByJobQuery(
            JobPostingId: jobId,
            Status: null,
            Page: page,
            PageSize: pageSize);

        var result = await _sender.Send(query);

        if (result.IsFailure)
        {
            return BadRequest(new { error = result.Error.Message });
        }

        return Ok(result.Value);
    }
}
