using System.Diagnostics;
using System.Security.Claims;
using Microsoft.Extensions.Options;

namespace UniHub.API.Middlewares;

public sealed class UserActionLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<UserActionLoggingMiddleware> _logger;
    private readonly UserActionLoggingOptions _options;

    public UserActionLoggingMiddleware(
        RequestDelegate next,
        ILogger<UserActionLoggingMiddleware> logger,
        IOptions<UserActionLoggingOptions> options)
    {
        _next = next;
        _logger = logger;
        _options = options.Value;
    }

    public async Task InvokeAsync(HttpContext context, IUserActionLogStore logStore)
    {
        if (!_options.Enabled || IsExcludedPath(context.Request.Path))
        {
            await _next(context);
            return;
        }

        var correlationHeaderName = ResolveCorrelationHeaderName();
        var correlationId = GetOrCreateCorrelationId(context, correlationHeaderName);
        context.Response.Headers[correlationHeaderName] = correlationId;

        var startedAtUtc = DateTime.UtcNow;
        var stopwatch = Stopwatch.StartNew();

        Exception? pipelineException = null;

        try
        {
            await _next(context);
        }
        catch (Exception exception)
        {
            pipelineException = exception;
            throw;
        }
        finally
        {
            stopwatch.Stop();

            var statusCode = pipelineException is null
                ? context.Response.StatusCode
                : MapExceptionToStatusCode(pipelineException);

            var actorUserId = ResolveActorUserId(context.User);
            var endpoint = context.GetEndpoint();
            var endpointName = endpoint?.DisplayName ?? "UnknownEndpoint";
            var traceId = Activity.Current?.Id ?? context.TraceIdentifier;
            var method = context.Request.Method;
            var path = context.Request.Path.Value ?? string.Empty;
            var remoteIp = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            var userAgent = context.Request.Headers.UserAgent.ToString();
            var queryString = context.Request.QueryString.Value ?? string.Empty;
            var completedAtUtc = DateTime.UtcNow;
            var result = pipelineException is null ? "Success" : "Error";

            var logEntry = new UserActionLogEntry
            {
                ActionType = "UserAction",
                ActorUserId = actorUserId,
                Method = method,
                Path = path,
                QueryString = queryString,
                Endpoint = endpointName,
                StatusCode = statusCode,
                DurationMs = stopwatch.ElapsedMilliseconds,
                TraceId = traceId,
                CorrelationId = correlationId,
                RemoteIp = remoteIp,
                UserAgent = string.IsNullOrWhiteSpace(userAgent) ? "unknown" : userAgent,
                Scheme = context.Request.Scheme,
                Host = context.Request.Host.Value ?? string.Empty,
                StartedAtUtc = startedAtUtc,
                CompletedAtUtc = completedAtUtc,
                Result = result,
                ExceptionType = pipelineException?.GetType().Name,
                ExceptionMessage = pipelineException?.Message
            };

            var logPayload = new Dictionary<string, object?>
            {
                ["ActionType"] = "UserAction",
                ["ActorUserId"] = actorUserId,
                ["Method"] = method,
                ["Path"] = path,
                ["Endpoint"] = endpointName,
                ["StatusCode"] = statusCode,
                ["DurationMs"] = stopwatch.ElapsedMilliseconds,
                ["TraceId"] = traceId,
                ["CorrelationId"] = correlationId,
                ["RemoteIp"] = remoteIp,
                ["UserAgent"] = string.IsNullOrWhiteSpace(userAgent) ? "unknown" : userAgent,
                ["StartedAtUtc"] = startedAtUtc,
                ["CompletedAtUtc"] = completedAtUtc,
                ["Result"] = result
            };

            if (_options.PersistToMongo)
            {
                await logStore.AppendAsync(logEntry, context.RequestAborted);
            }

            using (_logger.BeginScope(logPayload))
            {
                if (statusCode >= 500)
                {
                    _logger.LogError(
                        pipelineException,
                        "User action failed: {Method} {Path} => {StatusCode} in {DurationMs}ms (Actor: {ActorUserId}, CorrelationId: {CorrelationId})",
                        method,
                        path,
                        statusCode,
                        stopwatch.ElapsedMilliseconds,
                        actorUserId,
                        correlationId);
                }
                else if (statusCode >= 400)
                {
                    _logger.LogWarning(
                        "User action completed with client error: {Method} {Path} => {StatusCode} in {DurationMs}ms (Actor: {ActorUserId}, CorrelationId: {CorrelationId})",
                        method,
                        path,
                        statusCode,
                        stopwatch.ElapsedMilliseconds,
                        actorUserId,
                        correlationId);
                }
                else
                {
                    _logger.LogInformation(
                        "User action completed: {Method} {Path} => {StatusCode} in {DurationMs}ms (Actor: {ActorUserId}, CorrelationId: {CorrelationId})",
                        method,
                        path,
                        statusCode,
                        stopwatch.ElapsedMilliseconds,
                        actorUserId,
                        correlationId);
                }
            }
        }
    }

    private bool IsExcludedPath(PathString requestPath)
    {
        var pathValue = requestPath.Value;
        if (string.IsNullOrWhiteSpace(pathValue))
        {
            return false;
        }

        foreach (var prefix in _options.ExcludedPathPrefixes)
        {
            if (!string.IsNullOrWhiteSpace(prefix)
                && pathValue.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }
        }

        return false;
    }

    private static string ResolveActorUserId(ClaimsPrincipal user)
    {
        return user.FindFirst("sub")?.Value
               ?? user.FindFirst(ClaimTypes.NameIdentifier)?.Value
               ?? user.Identity?.Name
               ?? "anonymous";
    }

    private string ResolveCorrelationHeaderName()
    {
        return string.IsNullOrWhiteSpace(_options.CorrelationHeaderName)
            ? "X-Correlation-Id"
            : _options.CorrelationHeaderName.Trim();
    }

    private static string GetOrCreateCorrelationId(HttpContext context, string correlationHeaderName)
    {
        if (context.Request.Headers.TryGetValue(correlationHeaderName, out var values)
            && !string.IsNullOrWhiteSpace(values.FirstOrDefault()))
        {
            return values.First()!;
        }

        return Activity.Current?.TraceId.ToString() ?? Guid.NewGuid().ToString("N");
    }

    private static int MapExceptionToStatusCode(Exception exception)
    {
        return exception switch
        {
            OperationCanceledException => 499,
            SharedKernel.Exceptions.ValidationException => StatusCodes.Status400BadRequest,
            SharedKernel.Exceptions.NotFoundException => StatusCodes.Status404NotFound,
            SharedKernel.Exceptions.UnauthorizedException => StatusCodes.Status401Unauthorized,
            SharedKernel.Exceptions.ForbiddenException => StatusCodes.Status403Forbidden,
            SharedKernel.Exceptions.DomainException => StatusCodes.Status400BadRequest,
            _ => StatusCodes.Status500InternalServerError
        };
    }
}
