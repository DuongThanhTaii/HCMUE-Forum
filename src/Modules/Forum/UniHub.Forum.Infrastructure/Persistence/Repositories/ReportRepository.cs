using Microsoft.EntityFrameworkCore;
using UniHub.Forum.Application.Abstractions;
using UniHub.Forum.Domain.Reports;
using UniHub.Infrastructure.Persistence;

namespace UniHub.Forum.Infrastructure.Persistence.Repositories;

/// <summary>
/// EF Core implementation of report repository for Forum module
/// </summary>
public sealed class ReportRepository : IReportRepository
{
    private readonly ApplicationDbContext _context;

    public ReportRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Report?> GetByIdAsync(ReportId id, CancellationToken cancellationToken = default)
    {
        return await _context.Reports
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
    }

    public async Task<Report?> GetByReporterAndItemAsync(
        Guid reporterId,
        Guid reportedItemId,
        ReportedItemType reportedItemType,
        CancellationToken cancellationToken = default)
    {
        return await _context.Reports
            .FirstOrDefaultAsync(r =>
                r.ReporterId == reporterId &&
                r.ReportedItemId == reportedItemId &&
                r.ReportedItemType == reportedItemType,
                cancellationToken);
    }

    public async Task<(IReadOnlyList<Report> Reports, int TotalCount)> GetReportsAsync(
        int pageNumber,
        int pageSize,
        ReportStatus? status = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Reports.AsQueryable();

        // Filter by status if provided
        if (status.HasValue)
        {
            query = query.Where(r => r.Status == status.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        // Apply pagination and ordering
        var reports = await query
            .OrderByDescending(r => r.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        return (reports.AsReadOnly(), totalCount);
    }

    public async Task AddAsync(Report report, CancellationToken cancellationToken = default)
    {
        await _context.Reports.AddAsync(report, cancellationToken);
    }

    public Task UpdateAsync(Report report, CancellationToken cancellationToken = default)
    {
        _context.Reports.Update(report);
        return Task.CompletedTask;
    }
}
