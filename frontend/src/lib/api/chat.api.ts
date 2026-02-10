import { apiClient } from './client';
import type {
  Conversation,
  Message,
  Channel,
  AIConversation,
  AIMessage,
  MessagesQueryParams,
  CreateDirectConversationInput,
  CreateGroupConversationInput,
  SendMessageInput,
  CreateChannelInput,
  SendAIMessageInput,
  PaginatedMessages,
} from '@/types/api/chat.types';

export const chatApi = {
  // Conversations
  getConversations: () =>
    apiClient.get<Conversation[]>('/api/v1/chat/conversations'),

  createDirectConversation: (data: CreateDirectConversationInput) =>
    apiClient.post<Conversation>('/api/v1/chat/conversations/direct', data),

  createGroupConversation: (data: CreateGroupConversationInput) =>
    apiClient.post<Conversation>('/api/v1/chat/conversations/group', data),

  addParticipant: (conversationId: string, participantId: string) =>
    apiClient.post(`/api/v1/chat/conversations/${conversationId}/participants`, { participantId }),

  removeParticipant: (conversationId: string, participantId: string) =>
    apiClient.delete(`/api/v1/chat/conversations/${conversationId}/participants/${participantId}`),

  // Messages
  getMessages: (params: MessagesQueryParams) =>
    apiClient.get<PaginatedMessages>('/api/v1/chat/messages', { params }),

  sendMessage: (data: SendMessageInput) =>
    apiClient.post<Message>('/api/v1/chat/messages', data),

  uploadFile: (conversationId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('conversationId', conversationId);
    return apiClient.post<{ fileUrl: string; fileName: string; fileSize: number }>(
      '/api/v1/chat/messages/upload',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
  },

  sendMessageWithAttachment: (data: SendMessageInput) =>
    apiClient.post<Message>('/api/v1/chat/messages/with-attachments', data),

  getReadReceipts: (messageId: string) =>
    apiClient.get<Array<{ userId: string; userName: string; readAt: string }>>(
      `/api/v1/chat/messages/${messageId}/read-receipts`
    ),

  // Channels
  getPublicChannels: () =>
    apiClient.get<Channel[]>('/api/v1/chat/channels/public'),

  getMyChannels: () =>
    apiClient.get<Channel[]>('/api/v1/chat/channels/my-channels'),

  createChannel: (data: CreateChannelInput) =>
    apiClient.post<Channel>('/api/v1/chat/channels', data),

  joinChannel: (channelId: string) =>
    apiClient.post(`/api/v1/chat/channels/${channelId}/join`),

  leaveChannel: (channelId: string) =>
    apiClient.post(`/api/v1/chat/channels/${channelId}/leave`),

  // AI Bot
  sendAIMessage: (data: SendAIMessageInput) =>
    apiClient.post<AIMessage>('/api/v1/ai/chat', data),

  getAIConversations: () =>
    apiClient.get<AIConversation[]>('/api/v1/ai/conversations'),

  getAIConversation: (conversationId: string) =>
    apiClient.get<{ conversation: AIConversation; messages: AIMessage[] }>(
      `/api/v1/ai/conversations/${conversationId}`
    ),
};
