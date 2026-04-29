import { baseApi } from '@shared/lib/api/baseApi'
import type { ForumListItem } from '../types/forum-list'

type ApiSuccessEnvelope<T> = {
  success?: boolean
  message?: string
  data?: T
}

type RawForumPost = {
  id?: string
  title?: string
  tags?: string[] | null
  categoryName?: string | null
  category?: { name?: string | null } | null
  categoryId?: string | null
  commentCount?: number | null
  replyCount?: number | null
  updatedAt?: string | null
  publishedAt?: string | null
  createdAt?: string | null
  content?: string | null
  body?: string | null
}

type RawForumComment = {
  id?: string
  postId?: string
  authorId?: string
  content?: string
  parentCommentId?: string | null
  voteScore?: number
  isAcceptedAnswer?: boolean
  createdAt?: string
  updatedAt?: string | null
}

type PostsPayload = {
  posts?: RawForumPost[]
  items?: RawForumPost[]
}

type CommentsPayload = {
  comments?: RawForumComment[]
  items?: RawForumComment[]
}

type ForumListQueryParams = {
  pageNumber?: number
  pageSize?: number
}

type VoteType = 1 | 2

type ForumCommentItem = {
  id: string
  postId: string
  authorId: string
  authorName: string
  content: string
  voteScore: number
  createdAt: string
  updatedAt?: string
}

type AddCommentRequest = {
  postId: string
  content: string
  parentCommentId?: string
}

type VotePostRequest = {
  postId: string
  voteType: VoteType
}

type ReportPostRequest = {
  postId: string
  reason: number
  description?: string
}

function toSafeForumListItem(post: RawForumPost, index: number): ForumListItem {
  const id = post.id && post.id.trim().length > 0 ? post.id : `post-${index}`
  const title = post.title && post.title.trim().length > 0 ? post.title : 'Untitled post'
  const category =
    post.categoryName?.trim() ||
    post.category?.name?.trim() ||
    (post.categoryId ? `Category ${post.categoryId.slice(0, 8)}` : 'General')
  const tags = Array.isArray(post.tags) ? post.tags.filter((tag): tag is string => Boolean(tag?.trim())) : []
  const replyCount = Math.max(0, post.replyCount ?? post.commentCount ?? 0)
  const activityAt = post.updatedAt || post.publishedAt || post.createdAt || '1970-01-01T00:00:00.000Z'

  return {
    id,
    title,
    category,
    tags,
    replyCount,
    activityAt,
  }
}

export type ForumDetailItem = ForumListItem & {
  content?: string
  body?: string
}

function toSafeForumDetailItem(post: RawForumPost, idFallback: string): ForumDetailItem {
  const base = toSafeForumListItem(post, 0)
  const id = post.id?.trim() || idFallback
  const content = post.content?.trim() || undefined
  const body = post.body?.trim() || undefined

  return {
    ...base,
    id,
    content,
    body,
  }
}

function toSafeForumCommentItem(comment: RawForumComment, postIdFallback: string, index: number): ForumCommentItem {
  const id = comment.id?.trim() || `comment-${index}`
  const postId = comment.postId?.trim() || postIdFallback
  const authorId = comment.authorId?.trim() || 'unknown-author'
  const content = comment.content?.trim() || ''
  const createdAt = comment.createdAt || '1970-01-01T00:00:00.000Z'

  return {
    id,
    postId,
    authorId,
    // Until BE returns profile joins for comments, keep deterministic fallback label.
    authorName: `User ${authorId.slice(0, 8)}`,
    content,
    voteScore: comment.voteScore ?? 0,
    createdAt,
    updatedAt: comment.updatedAt ?? undefined,
  }
}

export const forumListApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getForumList: builder.query<ForumListItem[], ForumListQueryParams | undefined>({
      query: (params = {}) => ({
        // Backend controller route: [Route("api/v1/posts")] + [HttpGet]
        url: '/api/v1/posts',
        params: {
          pageNumber: params.pageNumber ?? 1,
          pageSize: params.pageSize ?? 20,
        },
      }),
      transformResponse: (response: ApiSuccessEnvelope<PostsPayload>) => {
        const payload = response?.data
        const posts = payload?.posts ?? payload?.items ?? []
        return posts.map(toSafeForumListItem)
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map((post) => ({ type: 'ForumPost' as const, id: post.id })),
              { type: 'ForumPost' as const, id: 'LIST' },
            ]
          : [{ type: 'ForumPost' as const, id: 'LIST' }],
    }),
    getForumPostById: builder.query<ForumDetailItem, string>({
      query: (id) => ({
        // Backend controller route: [Route("api/v1/posts")] + [HttpGet("{id}")]
        url: `/api/v1/posts/${id}`,
      }),
      transformResponse: (response: ApiSuccessEnvelope<RawForumPost>, _meta, id) => {
        const payload = response?.data ?? {}
        return toSafeForumDetailItem(payload, id)
      },
      providesTags: (_result, _error, id) => [{ type: 'ForumPost' as const, id }],
    }),
    getPostComments: builder.query<ForumCommentItem[], { postId: string; pageNumber?: number; pageSize?: number }>({
      query: ({ postId, pageNumber = 1, pageSize = 20 }) => ({
        url: `/api/v1/posts/${postId}/comments`,
        params: { pageNumber, pageSize },
      }),
      transformResponse: (response: ApiSuccessEnvelope<CommentsPayload>, _meta, arg) => {
        const payload = response?.data
        const comments = payload?.comments ?? payload?.items ?? []
        return comments.map((comment, index) => toSafeForumCommentItem(comment, arg.postId, index))
      },
      providesTags: (_result, _error, { postId }) => [
        { type: 'Comment' as const, id: `POST-${postId}` },
      ],
    }),
    addComment: builder.mutation<void, AddCommentRequest>({
      query: ({ postId, content, parentCommentId }) => ({
        url: `/api/v1/comments/posts/${postId}`,
        method: 'POST',
        body: { content, parentCommentId },
      }),
      invalidatesTags: (_result, _error, { postId }) => [
        { type: 'Comment' as const, id: `POST-${postId}` },
        { type: 'ForumPost' as const, id: postId },
        { type: 'ForumPost' as const, id: 'LIST' },
      ],
    }),
    votePost: builder.mutation<void, VotePostRequest>({
      query: ({ postId, voteType }) => ({
        url: `/api/v1/posts/${postId}/vote`,
        method: 'POST',
        body: { voteType },
      }),
      invalidatesTags: (_result, _error, { postId }) => [
        { type: 'ForumPost' as const, id: postId },
        { type: 'ForumPost' as const, id: 'LIST' },
      ],
    }),
    bookmarkPost: builder.mutation<void, { postId: string }>({
      query: ({ postId }) => ({
        url: `/api/v1/posts/${postId}/bookmark`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, { postId }) => [
        { type: 'ForumPost' as const, id: postId },
        { type: 'ForumPost' as const, id: 'LIST' },
      ],
    }),
    unbookmarkPost: builder.mutation<void, { postId: string }>({
      query: ({ postId }) => ({
        url: `/api/v1/posts/${postId}/bookmark`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { postId }) => [
        { type: 'ForumPost' as const, id: postId },
        { type: 'ForumPost' as const, id: 'LIST' },
      ],
    }),
    reportPost: builder.mutation<void, ReportPostRequest>({
      query: ({ postId, reason, description }) => ({
        url: `/api/v1/posts/${postId}/report`,
        method: 'POST',
        body: { reason, description },
      }),
      invalidatesTags: (_result, _error, { postId }) => [
        { type: 'ForumPost' as const, id: postId },
        { type: 'ForumPost' as const, id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useGetForumListQuery,
  useGetForumPostByIdQuery,
  useGetPostCommentsQuery,
  useAddCommentMutation,
  useVotePostMutation,
  useBookmarkPostMutation,
  useUnbookmarkPostMutation,
  useReportPostMutation,
} = forumListApi
