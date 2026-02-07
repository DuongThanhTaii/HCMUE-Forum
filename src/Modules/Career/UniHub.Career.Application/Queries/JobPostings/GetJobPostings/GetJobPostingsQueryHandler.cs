using UniHub.Career.Application.Abstractions;
using UniHub.SharedKernel.CQRS;
using UniHub.SharedKernel.Results;

namespace UniHub.Career.Application.Queries.JobPostings.GetJobPostings;

/// <summary>
/// Handler for GetJobPostingsQuery.
/// </summary>
public sealed class GetJobPostingsQueryHandler
    : IQueryHandler<GetJobPostingsQuery, JobPostingListResponse>
{
    private readonly IJobPostingRepository _jobPostingRepository;

    public GetJobPostingsQueryHandler(IJobPostingRepository jobPostingRepository)
    {
        _jobPostingRepository = jobPostingRepository;
    }

    public async Task<Result<JobPostingListResponse>> Handle(
        GetJobPostingsQuery query,
        CancellationToken cancellationToken)
    {
        // Get paginated job postings from repository
        var (jobPostings, totalCount) = await _jobPostingRepository.GetAllAsync(
            query.Page,
            query.PageSize,
            query.CompanyId,
            query.JobType,
            query.ExperienceLevel,
            query.Status,
            query.City,
            query.IsRemote,
            query.SearchTerm,
            cancellationToken);

        // Map to summary DTOs
        var items = jobPostings.Select(jp => new JobPostingSummary(
            jp.Id.Value,
            jp.Title,
            jp.CompanyId,
            jp.JobType.ToString(),
            jp.ExperienceLevel.ToString(),
            jp.Status.ToString(),
            jp.Location.City,
            jp.Location.IsRemote,
            jp.Salary != null 
                ? new SalaryInfo(
                    jp.Salary.MinAmount,
                    jp.Salary.MaxAmount,
                    jp.Salary.Currency,
                    jp.Salary.Period)
                : null,
            jp.Deadline,
            jp.CreatedAt,
            jp.PublishedAt,
            jp.ViewCount,
            jp.ApplicationCount
        )).ToList();

        var totalPages = (int)Math.Ceiling((double)totalCount / query.PageSize);

        var response = new JobPostingListResponse(
            items,
            totalCount,
            query.Page,
            query.PageSize,
            totalPages);

        return Result.Success(response);
    }
}
