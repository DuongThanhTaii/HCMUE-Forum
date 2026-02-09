using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace UniHub.Infrastructure.Persistence.Seeding;

/// <summary>
/// Orchestrates database seeding operations.
/// Applies migrations and seeds initial data.
/// </summary>
public static class DatabaseSeeder
{
    /// <summary>
    /// Applies pending migrations and seeds initial data.
    /// </summary>
    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<ApplicationDbContext>>();

        try
        {
            logger.LogInformation("Applying database migrations...");
            await context.Database.MigrateAsync();
            logger.LogInformation("Database migrations applied successfully.");

            // Seed data in order of dependencies
            await IdentitySeed.SeedAsync(context, logger);
            await ForumSeed.SeedAsync(context, logger);
            await LearningSeed.SeedAsync(context, logger);

            logger.LogInformation("Database seeding completed successfully.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while seeding the database.");
            throw;
        }
    }
}
