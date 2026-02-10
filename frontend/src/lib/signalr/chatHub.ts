import { SignalRConnection } from './connection';
import type { Message } from '@/types/api/chat.types';

const CHAT_HUB_URL = `${process.env.NEXT_PUBLIC_SIGNALR_URL}/hubs/chat`;

export class ChatHub {
  private connection: SignalRConnection;

  constructor() {
    this.connection = new SignalRConnection(CHAT_HUB_URL);
  }

  async start() {
    await this.connection.start();
  }

  async stop() {
    await this.connection.stop();
  }

  // Server methods
  async joinConversation(conversationId: string) {
    return await this.connection.invoke('JoinConversation', conversationId);
  }

  async leaveConversation(conversationId: string) {
    return await this.connection.invoke('LeaveConversation', conversationId);
  }

  async sendMessage(
    conversationId: string,
    content: string,
    messageType: 'Text' | 'File',
    replyToMessageId?: string
  ) {
    return await this.connection.invoke(
      'SendMessage',
      conversationId,
      content,
      messageType,
      replyToMessageId
    );
  }

  async sendTypingIndicator(conversationId: string, isTyping: boolean) {
    return await this.connection.invoke('SendTypingIndicator', conversationId, isTyping);
  }

  async addReaction(messageId: string, emoji: string) {
    return await this.connection.invoke('AddReaction', messageId, emoji);
  }

  async removeReaction(messageId: string, emoji: string) {
    return await this.connection.invoke('RemoveReaction', messageId, emoji);
  }

  async markAsRead(messageId: string) {
    return await this.connection.invoke('MarkAsRead', messageId);
  }

  // Client events
  onReceiveMessage(callback: (message: Message) => void) {
    this.connection.on('ReceiveMessage', callback);
  }

  onMessageEdited(callback: (messageId: string, newContent: string) => void) {
    this.connection.on('MessageEdited', callback);
  }

  onMessageDeleted(callback: (messageId: string) => void) {
    this.connection.on('MessageDeleted', callback);
  }

  onUserJoined(callback: (conversationId: string, userId: string) => void) {
    this.connection.on('UserJoined', callback);
  }

  onUserLeft(callback: (conversationId: string, userId: string) => void) {
    this.connection.on('UserLeft', callback);
  }

  onUserTyping(callback: (conversationId: string, userId: string, isTyping: boolean) => void) {
    this.connection.on('UserTyping', callback);
  }

  onReactionAdded(callback: (messageId: string, userId: string, emoji: string) => void) {
    this.connection.on('ReactionAdded', callback);
  }

  onReactionRemoved(callback: (messageId: string, userId: string, emoji: string) => void) {
    this.connection.on('ReactionRemoved', callback);
  }

  onMessageRead(callback: (messageId: string, userId: string) => void) {
    this.connection.on('MessageRead', callback);
  }

  onUserStatusChanged(callback: (userId: string, status: string) => void) {
    this.connection.on('UserStatusChanged', callback);
  }

  // Remove event listeners
  offReceiveMessage(callback: (message: Message) => void) {
    this.connection.off('ReceiveMessage', callback);
  }

  offMessageEdited(callback: (messageId: string, newContent: string) => void) {
    this.connection.off('MessageEdited', callback);
  }

  offMessageDeleted(callback: (messageId: string) => void) {
    this.connection.off('MessageDeleted', callback);
  }

  offUserTyping(callback: (conversationId: string, userId: string, isTyping: boolean) => void) {
    this.connection.off('UserTyping', callback);
  }

  offUserStatusChanged(callback: (userId: string, status: string) => void) {
    this.connection.off('UserStatusChanged', callback);
  }

  get state() {
    return this.connection.state;
  }
}

// Singleton instance
let chatHubInstance: ChatHub | null = null;

export function getChatHub(): ChatHub {
  if (!chatHubInstance) {
    chatHubInstance = new ChatHub();
  }
  return chatHubInstance;
}
