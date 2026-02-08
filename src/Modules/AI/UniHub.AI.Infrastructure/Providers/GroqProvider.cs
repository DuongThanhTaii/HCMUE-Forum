using UniHub.AI.Application.Abstractions;
using UniHub.AI.Domain.AIProviders;

namespace UniHub.AI.Infrastructure.Providers;

/// <summary>
/// Groq AI provider implementation.
/// Fast inference with free tier available.
/// Full implementation will be completed in TASK-095.
/// </summary>
public sealed class GroqProvider : AIProviderBase
{
    public GroqProvider(AIProviderConfiguration configuration) : base(configuration)
    {
    }

    /// <inheritdoc />
    public override AIProviderType ProviderType => AIProviderType.Groq;

    /// <inheritdoc />
    public override async Task<AIResponse> SendChatRequestAsync(AIRequest request, CancellationToken cancellationToken = default)
    {
        // Check rate limit
        if (!await TryAcquireRequestSlotAsync(cancellationToken))
        {
            return CreateFailureResponse("Rate limit exceeded for Groq provider");
        }

        // TODO: Implement actual Groq API call in TASK-095
        // For now, return a placeholder response
        await Task.Delay(100, cancellationToken); // Simulate API call

        return CreateSuccessResponse("Groq provider response (placeholder)", 0);
    }
}
