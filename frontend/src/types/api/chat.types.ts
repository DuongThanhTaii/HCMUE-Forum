export interface User {
  id: string;
  fullName: string;
  email: string;
  avatar?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender: User;
  content: string;
  messageType: 'Text' | 'File';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  replyToMessageId?: string;
  replyTo?: {
    id: string;
    content: string;
    senderName: string;
  };
  reactions: Array<{ emoji: string; userIds: string[] }>;
  readBy: string[];
  createdAt: string;
  editedAt?: string;
}

export interface Participant {
  userId: string;
  userName: string;
  avatar?: string;
  isOnline: boolean;
  joinedAt: string;
}

export interface Conversation {
  id: string;
  name?: string;
  type: 'Direct' | 'Group';
  participants: Participant[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Channel {
  id: string;
  name: string;
  description?: string;
  memberCount: number;
  isPublic: boolean;
  createdBy: User;
  createdAt: string;
}

export interface AIConversation {
  id: string;
  userId: string;
  title?: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AIMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: Array<{
    id: string;
    type: string;
    function: {
      name: string;
      arguments: string;
    };
  }>;
  createdAt: string;
}

export interface MessagesQueryParams {
  conversationId: string;
  page?: number;
  pageSize?: number;
}

export interface CreateDirectConversationInput {
  participantId: string;
}

export interface CreateGroupConversationInput {
  name: string;
  participantIds: string[];
}

export interface SendMessageInput {
  conversationId: string;
  content: string;
  messageType: 'Text' | 'File';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  replyToMessageId?: string;
}

export interface CreateChannelInput {
  name: string;
  description?: string;
  isPublic: boolean;
}

export interface SendAIMessageInput {
  conversationId?: string;
  content: string;
}

export interface PaginatedMessages {
  items: Message[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}
