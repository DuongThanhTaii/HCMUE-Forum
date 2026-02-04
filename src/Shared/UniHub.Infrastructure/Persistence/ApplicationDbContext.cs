using Microsoft.EntityFrameworkCore;
using UniHub.SharedKernel.Domain;

namespace UniHub.Infrastructure.Persistence;

/// <summary>
/// Main database context for the application using PostgreSQL.
/// </summary>
public class ApplicationDbContext : DbContext
{
    /// <summary>
    /// Initializes a new instance of the <see cref="ApplicationDbContext"/> class.
    /// </summary>
    /// <param name="options">The options to configure the context.</param>
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    /// <summary>
    /// Configures the model for this context.
    /// </summary>
    /// <param name="modelBuilder">The builder being used to construct the model for this context.</param>
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply all entity configurations from the current assembly
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

        // Configure schema (optional, defaults to 'public')
        // modelBuilder.HasDefaultSchema("unihub");
    }

    /// <summary>
    /// Saves all changes made in this context to the database and dispatches domain events.
    /// </summary>
    /// <param name="cancellationToken">A cancellation token to observe while waiting for the task to complete.</param>
    /// <returns>The number of state entries written to the database.</returns>
    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // The interceptors will handle:
        // - Setting audit fields (AuditableEntityInterceptor)
        // - Collecting domain events (DomainEventInterceptor)
        return await base.SaveChangesAsync(cancellationToken);
    }
}
