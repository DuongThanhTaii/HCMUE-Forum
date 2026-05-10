export type ForumListItem = {
  id: string
  title: string
  category: string
  threadChannelId?: string
  threadChannelCode?: string
  threadChannelName?: string
  tags: string[]
  replyCount: number
  activityAt: string
}
