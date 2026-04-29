namespace UniHub.API.Middlewares;

public sealed class UserActionLoggingOptions
{
    public const string SectionName = "Observability:UserActionLogging";

    public bool Enabled { get; set; } = true;
    public bool PersistToMongo { get; set; } = true;
    public string MongoCollectionName { get; set; } = "user_action_logs";
    public int RetentionDays { get; set; } = 90;
    public int DefaultQueryPageSize { get; set; } = 100;
    public int MaxQueryPageSize { get; set; } = 500;
    public string CorrelationHeaderName { get; set; } = "X-Correlation-Id";
    public string[] ExcludedPathPrefixes { get; set; } = ["/health", "/openapi", "/scalar", "/hubs"];
}
