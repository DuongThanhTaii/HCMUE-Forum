using Serilog;
using UniHub.Identity.Infrastructure;
using UniHub.Infrastructure;
using UniHub.Forum.Infrastructure;
using UniHub.Learning.Infrastructure;

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
    builder.Services.AddOpenApi();

    // Add Controllers (for module API endpoints)
    builder.Services.AddControllers()
        .AddApplicationPart(typeof(UniHub.Identity.Presentation.Controllers.AuthController).Assembly)
        .AddApplicationPart(typeof(UniHub.Forum.Presentation.Controllers.PostsController).Assembly)
        .AddApplicationPart(typeof(UniHub.Learning.Presentation.Controllers.DocumentsController).Assembly);

    // Add MediatR for CQRS
    builder.Services.AddMediatR(cfg =>
    {
        cfg.RegisterServicesFromAssemblyContaining<UniHub.Identity.Application.Commands.Register.RegisterUserCommand>();
        cfg.RegisterServicesFromAssemblyContaining<UniHub.Forum.Application.Commands.CreatePost.CreatePostCommand>();
        cfg.RegisterServicesFromAssemblyContaining<UniHub.Learning.Application.Commands.UploadDocument.UploadDocumentCommand>();
    });

    // Add Infrastructure (PostgreSQL, MongoDB, Redis)
    builder.Services.AddInfrastructure(builder.Configuration);

    // Add Identity module
    builder.Services.AddIdentityInfrastructure(builder.Configuration);

    // Add Forum module
    builder.Services.AddForumInfrastructure();

    // Add Learning module
    builder.Services.AddLearningInfrastructure();

    // Add exception handler
    builder.Services.AddExceptionHandler<UniHub.API.Middlewares.GlobalExceptionHandler>();
    builder.Services.AddProblemDetails();

    // Add health checks
    builder.Services.AddHealthChecks();

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
    }

    app.UseHttpsRedirection();

    // Authentication & Authorization
    app.UseAuthentication();
    app.UseAuthorization();

    // Map API controllers
    app.MapControllers();

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
        PostgreSQL = !string.IsNullOrEmpty(config.GetConnectionString("PostgreSQL")),
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

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

    app.MapGet("/weatherforecast", () =>
    {
        var forecast =  Enumerable.Range(1, 5).Select(index =>
            new WeatherForecast
            (
                DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
                Random.Shared.Next(-20, 55),
                summaries[Random.Shared.Next(summaries.Length)]
            ))
            .ToArray();
        return forecast;
    })
    .WithName("GetWeatherForecast");

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

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
