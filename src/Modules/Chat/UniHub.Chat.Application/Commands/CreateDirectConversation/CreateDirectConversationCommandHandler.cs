using UniHub.Chat.Application.Abstractions;
using UniHub.Chat.Domain.Conversations;
using UniHub.SharedKernel.CQRS;
using UniHub.SharedKernel.Results;

namespace UniHub.Chat.Application.Commands.CreateDirectConversation;

/// <summary>
/// Handler for creating a new direct conversation
/// </summary>
public sealed class CreateDirectConversationCommandHandler 
    : ICommandHandler<CreateDirectConversationCommand, Guid>
{
    private readonly IConversationRepository _conversationRepository;

    public CreateDirectConversationCommandHandler(IConversationRepository conversationRepository)
    {
        _conversationRepository = conversationRepository;
    }

    public async Task<Result<Guid>> Handle(
        CreateDirectConversationCommand request,
        CancellationToken cancellationToken)
    {
        // Check if direct conversation already exists
        var existingConversation = await _conversationRepository
            .GetDirectConversationAsync(request.User1Id, request.User2Id, cancellationToken);

        if (existingConversation is not null)
        {
            // Return existing conversation ID instead of creating duplicate
            return Result.Success(existingConversation.Id.Value);
        }

        // Create new direct conversation
        var conversationResult = Conversation.CreateDirect(
            request.User1Id,
            request.User2Id,
            request.CreatorId);

        if (conversationResult.IsFailure)
        {
            return Result.Failure<Guid>(conversationResult.Error);
        }

        var conversation = conversationResult.Value;

        // Save conversation
        await _conversationRepository.AddAsync(conversation, cancellationToken);

        return Result.Success(conversation.Id.Value);
    }
}
