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
  authorName?: string | null
  commentCount?: number | null
  replyCount?: number | null
  voteScore?: number | null
  isBookmarked?: boolean | null
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
  authorName?: string | null
  content?: string
  parentCommentId?: string | null
  voteScore?: number
  currentUserVote?: number | null
  userVote?: number | null
  myVote?: number | null
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

export type ForumCommentItem = {
  id: string
  postId: string
  authorId: string
  authorName: string
  content: string
  parentCommentId: string | null
  voteScore: number
  currentUserVote: 0 | 1 | 2
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

type VoteCommentRequest = {
  commentId: string
  postId: string
  voteType: VoteType
}

type ReportPostRequest = {
  postId: string
  reason: number
  description?: string
}

/** Single cache key for post detail + mutations (GUID casing from URL vs API was breaking invalidation). */
export function normalizeForumPostId(raw: string): string {
  if (typeof raw !== 'string') {
    return ''
  }
  return raw.trim().toLowerCase()
}

function toSafeForumListItem(post: RawForumPost, index: number): ForumListItem {
  const id =
    post.id && post.id.trim().length > 0 ? normalizeForumPostId(post.id) : `post-${index}`
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
  authorName?: string
  voteScore?: number
  isBookmarked?: boolean
}

function toSafeForumDetailItem(post: RawForumPost, idFallback: string): ForumDetailItem {
  const base = toSafeForumListItem(post, 0)
  const id = post.id?.trim() ? normalizeForumPostId(post.id) : normalizeForumPostId(idFallback)
  const content = post.content?.trim() || undefined
  const body = post.body?.trim() || undefined
  const authorName = post.authorName?.trim() || undefined
  const voteScore = typeof post.voteScore === 'number' ? post.voteScore : undefined
  const isBookmarked = post.isBookmarked === true

  return {
    ...base,
    id,
    content,
    body,
    authorName,
    voteScore,
    isBookmarked,
  }
}

function toSafeForumCommentItem(comment: RawForumComment, postIdFallback: string, index: number): ForumCommentItem {
  const id = comment.id?.trim() || `comment-${index}`
  const postId = comment.postId?.trim()
    ? normalizeForumPostId(comment.postId)
    : normalizeForumPostId(postIdFallback)
  const authorId = comment.authorId?.trim() || 'unknown-author'
  const content = comment.content?.trim() || ''
  const createdAt = comment.createdAt || '1970-01-01T00:00:00.000Z'
  const parentRaw = comment.parentCommentId?.trim()
  const parentCommentId = parentRaw && parentRaw.length > 0 ? parentRaw : null
  const named = comment.authorName?.trim()
  const authorName =
    named && named.length > 0 ? named : `User ${authorId.slice(0, 8)}`
  const rawCurrentVote = comment.currentUserVote ?? comment.userVote ?? comment.myVote ?? null
  const currentUserVote: 0 | 1 | 2 = rawCurrentVote === 1 ? 1 : rawCurrentVote === -1 || rawCurrentVote === 2 ? 2 : 0

  return {
    id,
    postId,
    authorId,
    authorName,
    content,
    parentCommentId,
    voteScore: comment.voteScore ?? 0,
    currentUserVote,
    createdAt,
    updatedAt: comment.updatedAt ?? undefined,
  }
}

export const forumListApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // FE vote value (1 up, 2 down) to score delta value (+1 / -1).
    // API currently returns current user vote as 1 or -1.
    // We normalize comment.currentUserVote to FE space (1 / 2 / 0).
    // This helper keeps optimistic updates consistent with Reddit-style toggle.
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
      query: (id) => {
        const pid = normalizeForumPostId(id)
        return {
          url: `/api/v1/posts/${pid}`,
        }
      },
      serializeQueryArgs: ({ queryArgs }) => normalizeForumPostId(queryArgs),
      transformResponse: (response: ApiSuccessEnvelope<RawForumPost>, _meta, id) => {
        const payload = response?.data ?? {}
        return toSafeForumDetailItem(payload, id)
      },
      providesTags: (_result, _error, id) => [{ type: 'ForumPost' as const, id: normalizeForumPostId(id) }],
    }),
    getPostComments: builder.query<ForumCommentItem[], { postId: string; pageNumber?: number; pageSize?: number }>({
      query: ({ postId, pageNumber = 1, pageSize = 20 }) => {
        const pid = normalizeForumPostId(postId)
        return {
          url: `/api/v1/posts/${pid}/comments`,
          params: { pageNumber, pageSize },
        }
      },
      transformResponse: (response: ApiSuccessEnvelope<CommentsPayload>, _meta, arg) => {
        const payload = response?.data
        const comments = payload?.comments ?? payload?.items ?? []
        const pid = normalizeForumPostId(arg.postId)
        return comments.map((comment, index) => toSafeForumCommentItem(comment, pid, index))
      },
      providesTags: (_result, _error, { postId }) => [
        { type: 'Comment' as const, id: `POST-${normalizeForumPostId(postId)}` },
      ],
    }),
    addComment: builder.mutation<void, AddCommentRequest>({
      query: ({ postId, content, parentCommentId }) => {
        const pid = normalizeForumPostId(postId)
        return {
          url: `/api/v1/comments/posts/${pid}`,
          method: 'POST',
          body: { content, parentCommentId },
        }
      },
      invalidatesTags: (_result, _error, { postId }) => {
        const pid = normalizeForumPostId(postId)
        return [
          { type: 'Comment' as const, id: `POST-${pid}` },
          { type: 'ForumPost' as const, id: pid },
          { type: 'ForumPost' as const, id: 'LIST' },
        ]
      },
    }),
    votePost: builder.mutation<void, VotePostRequest>({
      query: ({ postId, voteType }) => {
        const pid = normalizeForumPostId(postId)
        return {
          url: `/api/v1/posts/${pid}/vote`,
          method: 'POST',
          body: { voteType },
        }
      },
      async onQueryStarted({ postId, voteType }, { dispatch, queryFulfilled }) {
        const pid = normalizeForumPostId(postId)
        if (!pid) return
        const delta = voteType === 1 ? 1 : -1
        const patch = dispatch(
          forumListApi.util.updateQueryData('getForumPostById', pid, (draft) => {
            draft.voteScore = (draft.voteScore ?? 0) + delta
          }),
        )
        try {
          await queryFulfilled
        } catch {
          patch.undo()
        }
      },
      invalidatesTags: (_result, _error, { postId }) => {
        const pid = normalizeForumPostId(postId)
        return [
          { type: 'ForumPost' as const, id: pid },
          { type: 'ForumPost' as const, id: 'LIST' },
        ]
      },
    }),
    voteComment: builder.mutation<void, VoteCommentRequest>({
      query: ({ commentId, voteType }) => ({
        url: `/api/v1/comments/${commentId}/vote`,
        method: 'POST',
        body: { voteType },
      }),
      async onQueryStarted({ commentId, postId, voteType }, { dispatch, queryFulfilled }) {
        const pid = normalizeForumPostId(postId)
        if (!pid) return
        const scoreValueFromVote = (value: 0 | 1 | 2) => {
          if (value === 1) return 1
          if (value === 2) return -1
          return 0
        }
        const patch = dispatch(
          forumListApi.util.updateQueryData(
            'getPostComments',
            { postId: pid, pageNumber: 1, pageSize: 30 },
            (draft) => {
              const c = draft.find((x) => x.id === commentId)
              if (!c) return
              const previousVote = c.currentUserVote ?? 0
              const nextVote: 0 | 1 | 2 = previousVote === voteType ? 0 : voteType
              const delta = scoreValueFromVote(nextVote) - scoreValueFromVote(previousVote)
              c.voteScore = (c.voteScore ?? 0) + delta
              c.currentUserVote = nextVote
            },
          ),
        )
        try {
          await queryFulfilled
        } catch {
          patch.undo()
        }
      },
      invalidatesTags: (_result, _error, { postId }) => [
        { type: 'Comment' as const, id: `POST-${normalizeForumPostId(postId)}` },
      ],
    }),
    bookmarkPost: builder.mutation<void, { postId: string }>({
      query: ({ postId }) => {
        const pid = normalizeForumPostId(postId)
        return {
          url: `/api/v1/posts/${pid}/bookmark`,
          method: 'POST',
        }
      },
      invalidatesTags: (_result, _error, { postId }) => {
        const pid = normalizeForumPostId(postId)
        return [
          { type: 'ForumPost' as const, id: pid },
          { type: 'ForumPost' as const, id: 'LIST' },
        ]
      },
    }),
    unbookmarkPost: builder.mutation<void, { postId: string }>({
      query: ({ postId }) => {
        const pid = normalizeForumPostId(postId)
        return {
          url: `/api/v1/posts/${pid}/bookmark`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (_result, _error, { postId }) => {
        const pid = normalizeForumPostId(postId)
        return [
          { type: 'ForumPost' as const, id: pid },
          { type: 'ForumPost' as const, id: 'LIST' },
        ]
      },
    }),
    reportPost: builder.mutation<void, ReportPostRequest>({
      query: ({ postId, reason, description }) => {
        const pid = normalizeForumPostId(postId)
        return {
          url: `/api/v1/posts/${pid}/report`,
          method: 'POST',
          body: { reason, description },
        }
      },
      invalidatesTags: (_result, _error, { postId }) => {
        const pid = normalizeForumPostId(postId)
        return [
          { type: 'ForumPost' as const, id: pid },
          { type: 'ForumPost' as const, id: 'LIST' },
        ]
      },
    }),
  }),
})

export const {
  useGetForumListQuery,
  useGetForumPostByIdQuery,
  useGetPostCommentsQuery,
  useAddCommentMutation,
  useVotePostMutation,
  useVoteCommentMutation,
  useBookmarkPostMutation,
  useUnbookmarkPostMutation,
  useReportPostMutation,
} = forumListApi
