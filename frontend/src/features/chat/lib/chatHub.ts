import * as signalR from '@microsoft/signalr'
import type { HubConnection } from '@microsoft/signalr'
import type { AppDispatch } from '../../../app/store'
import { chatApi } from '../api/chat.api'
import { getChatHubUrl } from './hubUrl'
import {
  getInvalidateTagsForHubMessage,
  invalidateTagsChannelDiscovery,
  invalidateTagsForConversationThread,
  parseHubMessageNotification,
  parseHubUserTyping,
  readChannelIdFromPayload,
  readConversationIdFromPayload,
} from './mapHubMessage'
import type { HubMessageNotification } from '../types/chat.types'

export function createChatConnection(getAccessToken: () => string | null): HubConnection {
  return new signalR.HubConnectionBuilder()
    .withUrl(getChatHubUrl(), {
      accessTokenFactory: async () => getAccessToken() ?? '',
    })
    .withAutomaticReconnect([0, 2000, 5000, 10_000])
    .build()
}

/** Method names the server invokes on the client (ASP.NET Core JSON → camelCase). */
export const CHAT_HUB_CLIENT_METHODS = [
  'receiveMessage',
  'messageEdited',
  'messageDeleted',
  'userJoined',
  'userLeft',
  'userTyping',
  'reactionAdded',
  'reactionRemoved',
  'messageRead',
  'channelUpdated',
  'userStatusChanged',
] as const

export type ChatHubHandlers = {
  onReceiveMessage?: (msg: HubMessageNotification) => void
  onUserTyping?: (payload: {
    userId: string
    userName: string
    conversationId: string
    isTyping: boolean
  }) => void
}

export function attachChatHubHandlers(
  connection: HubConnection,
  dispatch: AppDispatch,
  handlers: ChatHubHandlers
): void {
  const onReceive = (payload: unknown) => {
    const msg = parseHubMessageNotification(payload)
    if (!msg) return
    dispatch(chatApi.util.invalidateTags(getInvalidateTagsForHubMessage(msg)))
    handlers.onReceiveMessage?.(msg)
  }

  const onMessageEdited = (payload: unknown) => {
    const cid = readConversationIdFromPayload(payload)
    if (cid) {
      dispatch(chatApi.util.invalidateTags(invalidateTagsForConversationThread(cid)))
    }
  }

  const onMessageDeleted = onMessageEdited

  const onUserJoined = (payload: unknown) => {
    const conv = readConversationIdFromPayload(payload)
    const ch = readChannelIdFromPayload(payload)
    if (conv) {
      dispatch(chatApi.util.invalidateTags([{ type: 'ChatConversation', id: 'LIST' }]))
    }
    if (ch) {
      dispatch(chatApi.util.invalidateTags(invalidateTagsChannelDiscovery()))
    }
  }

  const onUserLeft = onUserJoined

  const onUserTyping = (payload: unknown) => {
    const t = parseHubUserTyping(payload)
    if (t) handlers.onUserTyping?.(t)
  }

  const onReaction = (payload: unknown) => {
    const cid = readConversationIdFromPayload(payload)
    if (cid) {
      dispatch(chatApi.util.invalidateTags(invalidateTagsForConversationThread(cid)))
    }
  }

  const onMessageRead = (payload: unknown) => {
    const cid = readConversationIdFromPayload(payload)
    if (cid) {
      dispatch(chatApi.util.invalidateTags(invalidateTagsForConversationThread(cid)))
    }
  }

  const onChannelUpdated = () => {
    dispatch(chatApi.util.invalidateTags(invalidateTagsChannelDiscovery()))
  }

  const onUserStatusChanged = () => {
    dispatch(chatApi.util.invalidateTags([{ type: 'ChatConversation', id: 'LIST' }]))
  }

  connection.on('receiveMessage', onReceive)
  connection.on('messageEdited', onMessageEdited)
  connection.on('messageDeleted', onMessageDeleted)
  connection.on('userJoined', onUserJoined)
  connection.on('userLeft', onUserLeft)
  connection.on('userTyping', onUserTyping)
  connection.on('reactionAdded', onReaction)
  connection.on('reactionRemoved', onReaction)
  connection.on('messageRead', onMessageRead)
  connection.on('channelUpdated', onChannelUpdated)
  connection.on('userStatusChanged', onUserStatusChanged)
}

export function detachChatHubHandlers(connection: HubConnection): void {
  for (const method of CHAT_HUB_CLIENT_METHODS) {
    connection.off(method)
  }
}
