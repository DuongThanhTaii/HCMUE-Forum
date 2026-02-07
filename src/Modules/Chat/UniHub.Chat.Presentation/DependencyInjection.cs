using Microsoft.Extensions.DependencyInjection;
using UniHub.Chat.Presentation.Services;

namespace UniHub.Chat.Presentation;

/// <summary>
/// Dependency injection configuration for Chat Presentation layer.
/// </summary>
public static class DependencyInjection
{
    /// <summary>
    /// Adds Chat Presentation services to the service collection, including SignalR.
    /// </summary>
    /// <param name="services">The service collection to add services to.</param>
    /// <returns>The service collection for method chaining.</returns>
    public static IServiceCollection AddChatPresentation(this IServiceCollection services)
    {
        // Register SignalR
        services.AddSignalR(options =>
        {
            // Enable detailed errors in development
            options.EnableDetailedErrors = true;
            
            // Configure keep-alive interval (default is 15 seconds)
            options.KeepAliveInterval = TimeSpan.FromSeconds(15);
            
            // Configure client timeout (default is 30 seconds)
            options.ClientTimeoutInterval = TimeSpan.FromSeconds(30);
            
            // Maximum message size (default is 32KB)
            options.MaximumReceiveMessageSize = 128 * 1024; // 128KB
        });

        // Register connection manager
        services.AddSingleton<IConnectionManager, ConnectionManager>();

        return services;
    }
}
