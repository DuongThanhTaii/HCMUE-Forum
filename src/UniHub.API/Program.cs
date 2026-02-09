using System.Threading.RateLimiting;
using Serilog;
using Scalar.AspNetCore;
using FluentValidation;
using UniHub.Infrastructure.Behaviors;
using UniHub.Identity.Infrastructure;
using UniHub.Infrastructure;
using UniHub.Forum.Infrastructure;
using UniHub.Learning.Infrastructure;
using UniHub.Chat.Infrastructure;
using UniHub.Chat.Presentation;
using UniHub.Chat.Presentation.Hubs;
using UniHub.Career.Infrastructure;
using UniHub.Notification.Infrastructure;
using UniHub.Notification.Presentation.Hubs;
using UniHub.AI.Infrastructure;

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(new ConfigurationBuilder()
        .SetBasePath(Directory.GetCurrentDirectory())
        .AddJsonFile("appsettings.json")
        .AddJsonFile($"appsettings.{Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production"}.json", optional: true)
        .Build())
    .Enrich.FromLogContext()
    .Enrich.WithMachineName()
    .Enrich.WithThreadId()
    .Enrich.WithProcessId()
    .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj} {Properties:j}{NewLine}{Exception}")
    .WriteTo.File(
        path: "logs/unihub-.log",
        rollingInterval: RollingInterval.Day,
        outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {Message:lj} {Properties:j}{NewLine}{Exception}",
        retainedFileCountLimit: 30)
    .CreateLogger();

try
{
    Log.Information("Starting UniHub API");

    var builder = WebApplication.CreateBuilder(args);

    // Use Serilog for logging
    builder.Host.UseSerilog();

    // Add services to the container.
    // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
    builder.Services.AddOpenApi(options =>
    {
        options.AddDocumentTransformer((document, context, ct) =>
        {
            document.Info = new Microsoft.OpenApi.OpenApiInfo
            {
                Title = "UniHub API",
                Version = "v1",
                Description = "UniHub - University Hub for Students & Lecturers"
            };
            return Task.CompletedTask;
        });
    });

    // Add Controllers (for module API endpoints)
    builder.Services.AddControllers()
        .AddApplicationPart(typeof(UniHub.Identity.Presentation.Controllers.AuthController).Assembly)
        .AddApplicationPart(typeof(UniHub.Forum.Presentation.Controllers.PostsController).Assembly)
        .AddApplicationPart(typeof(UniHub.Learning.Presentation.Controllers.DocumentsController).Assembly)
        .AddApplicationPart(typeof(UniHub.Chat.Presentation.Controllers.ConversationsController).Assembly)
        .AddApplicationPart(typeof(UniHub.Career.Presentation.Controllers.JobPostingsController).Assembly)
        .AddApplicationPart(typeof(UniHub.Notification.Presentation.Controllers.NotificationsController).Assembly)
        .AddApplicationPart(typeof(UniHub.AI.Presentation.Controllers.AIChatController).Assembly);

    // Add CORS policy
    var corsOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
        ?? new[] { "http://localhost:3000", "http://localhost:5173" };

    builder.Services.AddCors(options =>
    {
        options.AddPolicy("DefaultCorsPolicy", policy =>
        {
            policy.WithOrigins(corsOrigins)
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials(); // Required for SignalR
        });
    });

    // Add MediatR for CQRS
    builder.Services.AddMediatR(cfg =>
    {
        cfg.RegisterServicesFromAssemblyContaining<UniHub.Identity.Application.Commands.Register.RegisterUserCommand>();
        cfg.RegisterServicesFromAssemblyContaining<UniHub.Forum.Application.Commands.CreatePost.CreatePostCommand>();
        cfg.RegisterServicesFromAssemblyContaining<UniHub.Learning.Application.Commands.UploadDocument.UploadDocumentCommand>();
        cfg.RegisterServicesFromAssemblyContaining<UniHub.Chat.Application.Commands.CreateDirectConversation.CreateDirectConversationCommand>();
        cfg.RegisterServicesFromAssemblyContaining<UniHub.Career.Application.Commands.JobPostings.CreateJobPosting.CreateJobPostingCommand>();
        cfg.RegisterServicesFromAssemblyContaining<UniHub.Notification.Application.EventHandlers.UserRegisteredEventHandler>();

        // Register pipeline behaviors (order matters: validation → logging → performance → unhandled)
        cfg.AddOpenBehavior(typeof(ValidationBehavior<,>));
        cfg.AddOpenBehavior(typeof(LoggingBehavior<,>));
        cfg.AddOpenBehavior(typeof(PerformanceBehavior<,>));
        cfg.AddOpenBehavior(typeof(UnhandledExceptionBehavior<,>));
    });

    // Register FluentValidation validators from all module assemblies
    builder.Services.AddValidatorsFromAssemblyContaining<UniHub.Identity.Application.Commands.Register.RegisterUserCommand>();
    builder.Services.AddValidatorsFromAssemblyContaining<UniHub.Forum.Application.Commands.CreatePost.CreatePostCommand>();
    builder.Services.AddValidatorsFromAssemblyContaining<UniHub.Learning.Application.Commands.UploadDocument.UploadDocumentCommand>();
    builder.Services.AddValidatorsFromAssemblyContaining<UniHub.Chat.Application.Commands.CreateDirectConversation.CreateDirectConversationCommand>();
    builder.Services.AddValidatorsFromAssemblyContaining<UniHub.Career.Application.Commands.JobPostings.CreateJobPosting.CreateJobPostingCommand>();

    // Add Infrastructure (PostgreSQL, MongoDB, Redis)
    builder.Services.AddInfrastructure(builder.Configuration);

    // Add Identity module
    builder.Services.AddIdentityInfrastructure(builder.Configuration);

    // Add Forum module
    builder.Services.AddForumInfrastructure();

    // Add Learning module
    builder.Services.AddLearningInfrastructure();

    // Add Chat module (repositories + SignalR with Redis backplane)
    var chatBaseUrl = builder.Configuration["Chat:BaseUrl"] ?? "http://localhost:5000";
    builder.Services.AddChatInfrastructure(baseUrl: chatBaseUrl);
    builder.Services.AddChatPresentation(builder.Configuration);

    // Add Career module
    builder.Services.AddCareerInfrastructure();

    // Add Notification module
    builder.Services.AddNotificationInfrastructure(builder.Configuration);

    // Add AI module
    builder.Services.AddAIInfrastructure(builder.Configuration);

    // Add exception handler
    builder.Services.AddExceptionHandler<UniHub.API.Middlewares.GlobalExceptionHandler>();
    builder.Services.AddProblemDetails();

    // Add response compression
    builder.Services.AddResponseCompression(options =>
    {
        options.EnableForHttps = true;
    });

    // Add rate limiting
    builder.Services.AddRateLimiter(options =>
    {
        options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

        // Global default: 100 requests per minute per IP
        options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
            RateLimitPartition.GetFixedWindowLimiter(
                partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                factory: _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = 100,
                    Window = TimeSpan.FromMinutes(1)
                }));

        // Auth endpoints: 10 requests per minute (anti brute-force)
        options.AddPolicy("auth", context =>
            RateLimitPartition.GetFixedWindowLimiter(
                partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                factory: _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = 10,
                    Window = TimeSpan.FromMinutes(1)
                }));

        // AI endpoints: 20 requests per minute (expensive calls)
        options.AddPolicy("ai", context =>
            RateLimitPartition.GetFixedWindowLimiter(
                partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                factory: _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = 20,
                    Window = TimeSpan.FromMinutes(1)
                }));
    });

    var app = builder.Build();

    // Use exception handler
    app.UseExceptionHandler();

    // Use Serilog request logging
    app.UseSerilogRequestLogging(options =>
    {
        options.MessageTemplate = "HTTP {RequestMethod} {RequestPath} responded {StatusCode} in {Elapsed:0.0000} ms";
        options.EnrichDiagnosticContext = (diagnosticContext, httpContext) =>
        {
            diagnosticContext.Set("RequestHost", httpContext.Request.Host.Value);
            diagnosticContext.Set("RequestScheme", httpContext.Request.Scheme);
            diagnosticContext.Set("UserAgent", httpContext.Request.Headers.UserAgent.FirstOrDefault());
            diagnosticContext.Set("RemoteIP", httpContext.Connection.RemoteIpAddress);
        };
    });

    // Configure the HTTP request pipeline.
    if (app.Environment.IsDevelopment())
    {
        app.MapOpenApi();
        app.MapScalarApiReference(options =>
        {
            options.Title = "UniHub API";
            options.Theme = ScalarTheme.BluePlanet;
            options.DefaultHttpClient = new(ScalarTarget.CSharp, ScalarClient.HttpClient);
            options.Authentication = new ScalarAuthenticationOptions
            {
                PreferredSecurityScheme = "Bearer"
            };
        });
    }

    app.UseResponseCompression();
    app.UseHttpsRedirection();

    // Use CORS
    app.UseCors("DefaultCorsPolicy");

    // Use rate limiting
    app.UseRateLimiter();

    // Authentication & Authorization
    app.UseAuthentication();
    app.UseAuthorization();

    // Map API controllers
    app.MapControllers();

    // Map SignalR Hubs
    app.MapHub<ChatHub>("/hubs/chat");
    app.MapHub<NotificationHub>("/hubs/notifications");

    // Health check endpoint
    app.MapHealthChecks("/health");

    // JWT test endpoint
    app.MapGet("/auth/test", () => Results.Ok(new { Message = "JWT Authentication is working!", Timestamp = DateTime.UtcNow }))
        .RequireAuthorization()
        .WithName("TestJwtAuth");

    // Connection test endpoint
    app.MapGet("/health/connections", (IConfiguration config) =>
    {
        var connections = new
        {
            PostgreSQL = !string.IsNullOrEmpty(config.GetConnectionString("DefaultConnection")),
            MongoDB = !string.IsNullOrEmpty(config.GetConnectionString("MongoDB")),
            Redis = !string.IsNullOrEmpty(config.GetConnectionString("Redis"))
        };

        return Results.Ok(new
        {
            Status = "Healthy",
            Timestamp = DateTime.UtcNow,
            ConnectionsConfigured = connections
        });
    })
    .WithName("GetConnectionsHealth");

    // Seed database in development
    if (app.Environment.IsDevelopment())
    {
        await UniHub.Infrastructure.Persistence.Seeding.DatabaseSeeder.SeedAsync(app.Services);
    }

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
