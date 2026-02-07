using Microsoft.Extensions.DependencyInjection;

namespace UniHub.Learning.Infrastructure;

/// <summary>
/// Dependency injection configuration for Learning Infrastructure layer.
/// </summary>
public static class DependencyInjection
{
    /// <summary>
    /// Adds Learning Infrastructure services to the service collection.
    /// </summary>
    /// <param name="services">The service collection to add services to.</param>
    /// <returns>The service collection for method chaining.</returns>
    public static IServiceCollection AddLearningInfrastructure(this IServiceCollection services)
    {
        // TODO: Register repository implementations when created
        // services.AddScoped<IDocumentRepository, DocumentRepository>();
        // services.AddScoped<ICourseRepository, CourseRepository>();
        // services.AddScoped<IEventStore, MongoEventStore>();

        // TODO: Register external service implementations
        // services.AddScoped<IFileStorageService, LocalFileStorageService>();
        // services.AddScoped<IVirusScanService, ClamAvVirusScanService>();
        // services.AddScoped<IUserRatingService, UserRatingService>();
        // services.AddScoped<IUserDownloadService, UserDownloadService>();
        // services.AddScoped<IModeratorPermissionService, ModeratorPermissionService>();
        // services.AddScoped<IModeratorManagementPermissionService, ModeratorManagementPermissionService>();

        return services;
    }
}
