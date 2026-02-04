using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MongoDB.Driver;
using StackExchange.Redis;
using UniHub.Infrastructure.Caching;
using UniHub.Infrastructure.MongoDb;
using UniHub.Infrastructure.Persistence;
using UniHub.Infrastructure.Persistence.Interceptors;
using UniHub.SharedKernel.Persistence;

namespace UniHub.Infrastructure;

/// <summary>
/// Extension methods for configuring infrastructure services.
/// </summary>
public static class DependencyInjection
{
    /// <summary>
    /// Adds infrastructure services to the dependency injection container.
    /// </summary>
    /// <param name="services">The service collection.</param>
    /// <param name="configuration">The configuration.</param>
    /// <returns>The service collection for chaining.</returns>
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddPersistence(configuration);
        services.AddMongoDb(configuration);
        services.AddRedisCache(configuration);

        return services;
    }

    /// <summary>
    /// Adds persistence services including DbContext and interceptors.
    /// </summary>
    private static IServiceCollection AddPersistence(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Register interceptors
        services.AddSingleton<AuditableEntityInterceptor>();
        services.AddScoped<DomainEventInterceptor>();

        // Register DbContext
        services.AddDbContext<ApplicationDbContext>((serviceProvider, options) =>
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

            options.UseNpgsql(connectionString, npgsqlOptions =>
            {
                npgsqlOptions.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName);
                npgsqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 3,
                    maxRetryDelay: TimeSpan.FromSeconds(5),
                    errorCodesToAdd: null);
            });

            // Add interceptors
            var auditableInterceptor = serviceProvider.GetRequiredService<AuditableEntityInterceptor>();
            var domainEventInterceptor = serviceProvider.GetRequiredService<DomainEventInterceptor>();
            options.AddInterceptors(auditableInterceptor, domainEventInterceptor);

            // Enable detailed errors in development
            var detailedErrors = configuration.GetSection("DetailedErrors").Get<bool>();
            if (detailedErrors)
            {
                options.EnableDetailedErrors();
                options.EnableSensitiveDataLogging();
            }
        });

        // Register Unit of Work
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // Add health checks
        services.AddHealthChecks()
            .AddDbContextCheck<ApplicationDbContext>(
                name: "postgresql",
                tags: new[] { "database", "postgresql" });

        return services;
    }

    /// <summary>
    /// Adds MongoDB services.
    /// </summary>
    private static IServiceCollection AddMongoDb(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Configure MongoDB conventions
        MongoDbConfiguration.Configure();

        // Register settings
        var mongoSettings = configuration.GetSection(MongoDbSettings.SectionName).Get<MongoDbSettings>()
            ?? throw new InvalidOperationException($"MongoDB settings section '{MongoDbSettings.SectionName}' not found.");

        services.AddSingleton(mongoSettings);

        // Register MongoDB client
        services.AddSingleton<IMongoClient>(serviceProvider =>
        {
            var settings = serviceProvider.GetRequiredService<MongoDbSettings>();
            var mongoClientSettings = MongoClientSettings.FromConnectionString(settings.ConnectionString);
            
            mongoClientSettings.ConnectTimeout = TimeSpan.FromSeconds(settings.ConnectionTimeoutSeconds);
            mongoClientSettings.ServerSelectionTimeout = TimeSpan.FromSeconds(settings.ServerSelectionTimeoutSeconds);
            mongoClientSettings.MaxConnectionPoolSize = settings.MaxConnectionPoolSize;
            mongoClientSettings.MinConnectionPoolSize = settings.MinConnectionPoolSize;

            return new MongoClient(mongoClientSettings);
        });

        // Register MongoDB database
        services.AddSingleton<IMongoDatabase>(serviceProvider =>
        {
            var client = serviceProvider.GetRequiredService<IMongoClient>();
            var settings = serviceProvider.GetRequiredService<MongoDbSettings>();
            return client.GetDatabase(settings.DatabaseName);
        });

        // Register MongoDbContext
        services.AddSingleton<MongoDbContext>();

        // Note: MongoDB health check requires AspNetCore.HealthChecks.MongoDb package
        // and is configured with: .AddMongoDb(connectionString)
        // For now, basic connectivity can be verified through the IMongoClient registration

        return services;
    }

    /// <summary>
    /// Adds Redis caching services.
    /// </summary>
    private static IServiceCollection AddRedisCache(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var redisConnectionString = configuration.GetConnectionString("Redis")
            ?? throw new InvalidOperationException("Redis connection string not found.");

        // Register Redis connection multiplexer
        services.AddSingleton<IConnectionMultiplexer>(serviceProvider =>
        {
            var configurationOptions = ConfigurationOptions.Parse(redisConnectionString);
            configurationOptions.AbortOnConnectFail = false;
            configurationOptions.ConnectTimeout = 5000;
            configurationOptions.SyncTimeout = 5000;

            return ConnectionMultiplexer.Connect(configurationOptions);
        });

        // Register distributed cache with Redis
        services.AddStackExchangeRedisCache(options =>
        {
            options.Configuration = redisConnectionString;
            options.InstanceName = "UniHub:";
        });

        // Register cache service
        services.AddSingleton<ICacheService, RedisCacheService>();

        // Add SignalR with Redis backplane
        services.AddSignalR()
            .AddStackExchangeRedis(redisConnectionString, options =>
            {
                options.Configuration.AbortOnConnectFail = false;
                options.Configuration.ConnectTimeout = 5000;
            });

        // Add health check
        services.AddHealthChecks()
            .AddRedis(redisConnectionString, name: "redis", tags: new[] { "cache", "redis" });

        return services;
    }
}
