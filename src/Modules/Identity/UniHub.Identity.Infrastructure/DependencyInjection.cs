using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using UniHub.Identity.Application.Abstractions;
using UniHub.Identity.Infrastructure.Authentication;
using UniHub.Identity.Infrastructure.Authorization;
using UniHub.Identity.Infrastructure.Caching;
using UniHub.Identity.Infrastructure.Persistence.Repositories;

namespace UniHub.Identity.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddIdentityInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddAuthentication(configuration);
        services.AddRepositories();
        services.AddServices();
        
        return services;
    }

    private static IServiceCollection AddAuthentication(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Configure JWT settings
        services.Configure<JwtSettings>(configuration.GetSection(JwtSettings.SectionName));

        // Validate JWT settings
        services.AddSingleton<IValidateOptions<JwtSettings>, JwtSettingsValidation>();

        // Register JWT service
        services.AddScoped<IJwtService, JwtService>();

        // Configure JWT Bearer authentication
        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer();

        services.ConfigureOptions<JwtBearerOptionsSetup>();

        return services;
    }

    private static IServiceCollection AddRepositories(this IServiceCollection services)
    {
        services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IRoleRepository, RoleRepository>();
        services.AddScoped<IPermissionRepository, PermissionRepository>();
        services.AddScoped<IPasswordResetTokenRepository, PasswordResetTokenRepository>();

        return services;
    }

    private static IServiceCollection AddServices(this IServiceCollection services)
    {
        services.AddScoped<IPasswordHasher, PasswordHasher>();
        services.AddSingleton<IPermissionCache, InMemoryPermissionCache>();
        services.AddScoped<IPermissionChecker, PermissionChecker>();

        return services;
    }
}

/// <summary>
/// Validates JWT settings during application startup
/// </summary>
public sealed class JwtSettingsValidation : IValidateOptions<JwtSettings>
{
    public ValidateOptionsResult Validate(string? name, JwtSettings options)
    {
        var failures = new List<string>();

        if (string.IsNullOrWhiteSpace(options.SecretKey))
        {
            failures.Add("JWT SecretKey is required");
        }
        else if (options.SecretKey.Length < 32)
        {
            failures.Add("JWT SecretKey must be at least 32 characters long");
        }

        if (string.IsNullOrWhiteSpace(options.Issuer))
        {
            failures.Add("JWT Issuer is required");
        }

        if (string.IsNullOrWhiteSpace(options.Audience))
        {
            failures.Add("JWT Audience is required");
        }

        if (options.AccessTokenExpiryMinutes <= 0)
        {
            failures.Add("JWT AccessTokenExpiryMinutes must be greater than 0");
        }

        if (options.RefreshTokenExpiryDays <= 0)
        {
            failures.Add("JWT RefreshTokenExpiryDays must be greater than 0");
        }

        return failures.Count > 0
            ? ValidateOptionsResult.Fail(failures)
            : ValidateOptionsResult.Success;
    }
}