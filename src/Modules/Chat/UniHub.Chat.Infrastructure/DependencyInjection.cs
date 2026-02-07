using Microsoft.Extensions.DependencyInjection;
using UniHub.Chat.Application.Abstractions;
using UniHub.Chat.Infrastructure.Persistence.Repositories;
using UniHub.Chat.Infrastructure.Services;

namespace UniHub.Chat.Infrastructure;

/// <summary>
/// Dependency injection configuration for Chat Infrastructure layer.
/// </summary>
public static class DependencyInjection
{
    /// <summary>
    /// Adds Chat Infrastructure services to the service collection.
    /// </summary>
    /// <param name="services">The service collection to add services to.</param>
    /// <param name="uploadPath">Path for file uploads (defaults to wwwroot/uploads/chat)</param>
    /// <param name="baseUrl">Base URL for file access (defaults to http://localhost:5000)</param>
    /// <returns>The service collection for method chaining.</returns>
    public static IServiceCollection AddChatInfrastructure(
        this IServiceCollection services,
        string? uploadPath = null,
        string? baseUrl = null)
    {
        services.AddRepositories();
        services.AddServices(uploadPath, baseUrl);

        return services;
    }

    /// <summary>
    /// Registers all Chat repository implementations.
    /// </summary>
    private static IServiceCollection AddRepositories(this IServiceCollection services)
    {
        services.AddScoped<IConversationRepository, ConversationRepository>();
        services.AddScoped<IMessageRepository, MessageRepository>();
        services.AddScoped<IChannelRepository, ChannelRepository>();

        return services;
    }

    /// <summary>
    /// Registers all Chat services.
    /// </summary>
    private static IServiceCollection AddServices(
        this IServiceCollection services,
        string? uploadPath,
        string? baseUrl)
    {
        // Default paths
        var finalUploadPath = uploadPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "chat");
        var finalBaseUrl = baseUrl ?? "http://localhost:5000";

        services.AddScoped<IFileStorageService>(provider =>
            new LocalFileStorageService(finalUploadPath, finalBaseUrl));

        return services;
    }
}
