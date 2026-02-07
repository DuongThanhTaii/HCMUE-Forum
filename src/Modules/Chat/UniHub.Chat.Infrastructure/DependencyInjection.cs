using Microsoft.Extensions.DependencyInjection;
using UniHub.Chat.Application.Abstractions;
using UniHub.Chat.Infrastructure.Persistence.Repositories;

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
    /// <returns>The service collection for method chaining.</returns>
    public static IServiceCollection AddChatInfrastructure(this IServiceCollection services)
    {
        services.AddRepositories();

        return services;
    }

    /// <summary>
    /// Registers all Chat repository implementations.
    /// </summary>
    private static IServiceCollection AddRepositories(this IServiceCollection services)
    {
        services.AddScoped<IConversationRepository, ConversationRepository>();
        services.AddScoped<IMessageRepository, MessageRepository>();

        return services;
    }
}
