using UniHub.Forum.Application.Abstractions;
using UniHub.Forum.Domain.Reports;

namespace UniHub.Forum.Infrastructure.Persistence.Repositories;

/// <summary>
/// In-memory implementation of report repository for Forum module.
/// TODO: Replace with EF Core implementation when database is configured.
/// </summary>
public sealed class ReportRepository : IReportRepository
{
    private static readonly List<Report> _reports = new();
    private static readonly object _lock = new();

    public Task<Report?> GetByIdAsync(ReportId id, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            var report = _reports.FirstOrDefault(r => r.Id == id);
            return Task.FromResult(report);
        }
    }

    public Task<Report?> GetByReporterAndItemAsync(
        Guid reporterId,
        Guid reportedItemId,
        ReportedItemType reportedItemType,
        CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            var report = _reports.FirstOrDefault(r =>
                r.ReporterId == reporterId &&
                r.ReportedItemId == reportedItemId &&
                r.ReportedItemType == reportedItemType);
            return Task.FromResult(report);
        }
    }

    public Task<(IReadOnlyList<Report> Reports, int TotalCount)> GetReportsAsync(
        int pageNumber,
        int pageSize,
        ReportStatus? status = null,
        CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            var query = _reports.AsEnumerable();

            // Filter by status if provided
            if (status.HasValue)
            {
                query = query.Where(r => r.Status == status.Value);
            }

            var totalCount = query.Count();

            // Apply pagination and ordering
            var reports = query
                .OrderByDescending(r => r.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            return Task.FromResult<(IReadOnlyList<Report>, int)>((reports.AsReadOnly(), totalCount));
        }
    }

    public Task AddAsync(Report report, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            _reports.Add(report);
            return Task.CompletedTask;
        }
    }

    public Task UpdateAsync(Report report, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            var index = _reports.FindIndex(r => r.Id == report.Id);
            if (index >= 0)
            {
                _reports[index] = report;
            }
            return Task.CompletedTask;
        }
    }
}
