using UniHub.AI.Application.Abstractions;
using UniHub.AI.Domain.AIProviders;

namespace UniHub.AI.Infrastructure.Providers;

/// <summary>
/// Google Gemini AI provider implementation.
/// Google's AI model with competitive performance.
/// Full implementation will be completed in TASK-095.
/// </summary>
public sealed class GeminiProvider : AIProviderBase
{
    public GeminiProvider(AIProviderConfiguration configuration) : base(configuration)
    {
    }

    /// <inheritdoc />
    public override AIProviderType ProviderType => AIProviderType.Gemini;

    /// <inheritdoc />
    public override async Task<AIResponse> SendChatRequestAsync(AIRequest request, CancellationToken cancellationToken = default)
    {
        // Check rate limit
        if (!await TryAcquireRequestSlotAsync(cancellationToken))
        {
            return CreateFailureResponse("Rate limit exceeded for Gemini provider");
        }

        // TODO: Implement actual Gemini API call in TASK-095
        // For now, return a placeholder response
        await Task.Delay(100, cancellationToken); // Simulate API call

        return CreateSuccessResponse("Gemini provider response (placeholder)", 0);
    }
}
