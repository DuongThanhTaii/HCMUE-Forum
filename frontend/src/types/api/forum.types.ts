export interface User {
  id: string;
  fullName: string;
  email: string;
  avatar?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  postCount: number;
}

export type PostType = 'Discussion' | 'Question' | 'Announcement';
export type PostStatus = 'Draft' | 'Published' | 'Archived';
export type VoteType = 'Upvote' | 'Downvote';

export interface Post {
  id: string;
  title: string;
  content: string;
  postType: PostType;
  status: PostStatus;
  authorId: string;
  author: User;
  categoryId: string;
  category: Category;
  tags: Tag[];
  voteScore: number;
  userVote?: VoteType | null;
  commentCount: number;
  viewCount: number;
  isPinned: boolean;
  isBookmarked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  author: User;
  parentId?: string | null;
  replies?: Comment[];
  voteScore: number;
  userVote?: VoteType | null;
  isAccepted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PostsQueryParams {
  category?: string;
  type?: PostType;
  status?: PostStatus;
  tag?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface CreatePostInput {
  title: string;
  content: string;
  categoryId: string;
  postType: PostType;
  tags: string[];
  status?: PostStatus;
}

export interface UpdatePostInput {
  title?: string;
  content?: string;
  categoryId?: string;
  postType?: PostType;
  tags?: string[];
  status?: PostStatus;
}

export interface CreateCommentInput {
  content: string;
  postId: string;
  parentId?: string | null;
}

export interface UpdateCommentInput {
  content: string;
}

export interface VoteInput {
  postId?: string;
  commentId?: string;
  voteType: VoteType;
}
