using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using UniHub.Learning.Presentation.DTOs.Faculties;

namespace UniHub.Learning.Presentation.Controllers;

[ApiController]
[Route("api/v1/faculties")]
[Produces("application/json")]
public class FacultiesController : ControllerBase
{
    private readonly ISender _sender;

    public FacultiesController(ISender sender)
    {
        _sender = sender;
    }

    /// <summary>
    /// Get all faculties
    /// </summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult GetFaculties()
    {
        // Placeholder - would need GetFacultiesQuery implementation
        return Ok(new { message = "Faculty endpoints not yet implemented" });
    }

    /// <summary>
    /// Create a new faculty
    /// </summary>
    [HttpPost]
    [Authorize]
    [ProducesResponseType(typeof(CreateFacultyResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public IActionResult CreateFaculty([FromBody] CreateFacultyRequest request)
    {
        // Placeholder - would need CreateFacultyCommand implementation
        return StatusCode(StatusCodes.Status501NotImplemented, 
            new { message = "Faculty creation not yet implemented" });
    }
}
