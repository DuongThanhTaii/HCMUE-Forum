using Microsoft.Extensions.DependencyInjection;
using UniHub.Learning.Application.Abstractions;
using UniHub.Learning.Infrastructure.Persistence.Repositories;
using UniHub.Learning.Infrastructure.Services;

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
        services.AddRepositories();
        services.AddServices();

        return services;
    }

    /// <summary>
    /// Registers all Learning repository implementations with EF Core.
    /// </summary>
    private static IServiceCollection AddRepositories(this IServiceCollection services)
    {
        services.AddScoped<IDocumentRepository, DocumentRepository>();
        services.AddScoped<ICourseRepository, CourseRepository>();

        return services;
    }

    /// <summary>
    /// Registers all Learning service implementations.
    /// </summary>
    private static IServiceCollection AddServices(this IServiceCollection services)
    {
        // File storage - local filesystem implementation
        services.AddScoped<IFileStorageService, FileStorageService>();
        
        // Virus scanning - stub implementation
        services.AddScoped<IVirusScanService, VirusScanService>();
        
        // User tracking services
        services.AddScoped<IUserRatingService, UserRatingService>();
        services.AddScoped<IUserDownloadService, UserDownloadService>();
        
        // Permission services
        services.AddScoped<IModeratorPermissionService, ModeratorPermissionService>();
        services.AddScoped<IModeratorManagementPermissionService, ModeratorManagementPermissionService>();

        return services;
    }
}
