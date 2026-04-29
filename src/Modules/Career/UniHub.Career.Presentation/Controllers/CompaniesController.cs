using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using UniHub.Career.Application.Commands.Companies.RegisterCompany;
using UniHub.Career.Application.Queries.Companies.GetCompanyById;
using UniHub.Career.Application.Queries.Companies.GetCompanyStatistics;
using UniHub.Career.Application.Queries.Companies.GetRecentApplications;
using UniHub.Career.Application.Queries.JobPostings.GetJobPostings;
using UniHub.Contracts;

namespace UniHub.Career.Presentation.Controllers;

[ApiController]
[Route("api/v1/companies")]
[Produces("application/json")]
[Authorize]
public class CompaniesController : ControllerBase
{
    private readonly ISender _sender;

    public CompaniesController(ISender sender)
    {
        _sender = sender;
    }

    /// <summary>
    /// Register a new company
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<CompanyResponse>), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register(
        [FromBody] RegisterCompanyCommand command,
        CancellationToken cancellationToken)
    {
        var result = await _sender.Send(command, cancellationToken);

        if (result.IsFailure)
        {
            return BadRequest(ApiResponses.Failure(result.Error.Message));
        }

        return CreatedAtAction(
            nameof(GetById),
            new { id = result.Value.CompanyId },
            ApiResponses.Success(result.Value, "Company registered successfully"));
    }

    /// <summary>
    /// Get company by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<CompanyDetailResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var query = new GetCompanyByIdQuery(id);
        var result = await _sender.Send(query, cancellationToken);

        if (result.IsFailure)
        {
            return NotFound(ApiResponses.Failure(result.Error.Message));
        }

        return Ok(ApiResponses.Success(result.Value));
    }

    /// <summary>
    /// Get company statistics for dashboard
    /// </summary>
    [HttpGet("{id:guid}/statistics")]
    [ProducesResponseType(typeof(ApiResponse<CompanyStatisticsResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetStatistics(Guid id, CancellationToken cancellationToken)
    {
        var query = new GetCompanyStatisticsQuery(id);
        var result = await _sender.Send(query, cancellationToken);

        if (result.IsFailure)
        {
            return NotFound(ApiResponses.Failure(result.Error.Message));
        }

        return Ok(ApiResponses.Success(result.Value));
    }

    /// <summary>
    /// Get company's job postings
    /// </summary>
    [HttpGet("{id:guid}/jobs")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<JobPostingListResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetJobs(
        Guid id,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var query = new GetJobPostingsQuery(
            Page: page,
            PageSize: pageSize,
            CompanyId: id,
            JobType: null,
            ExperienceLevel: null,
            Status: null,
            City: null,
            IsRemote: null,
            SearchTerm: null);

        var result = await _sender.Send(query, cancellationToken);

        if (result.IsFailure)
        {
            return BadRequest(ApiResponses.Failure(result.Error.Message));
        }

        return Ok(ApiResponses.Success(result.Value));
    }

    /// <summary>
    /// Get recent applications for company
    /// </summary>
    [HttpGet("{id:guid}/applications")]
    [ProducesResponseType(typeof(ApiResponse<RecentApplicationsResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetRecentApplications(
        Guid id,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var query = new GetRecentApplicationsQuery(id, page, pageSize);
        var result = await _sender.Send(query, cancellationToken);

        if (result.IsFailure)
        {
            return NotFound(ApiResponses.Failure(result.Error.Message));
        }

        return Ok(ApiResponses.Success(result.Value));
    }
}
