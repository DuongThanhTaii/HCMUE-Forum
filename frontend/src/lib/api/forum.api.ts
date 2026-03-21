import { apiClient } from './client';
import type {
  Post,
  Comment,
  Tag,
  Category,
  PostsQueryParams,
  PaginatedResponse,
  CreatePostInput,
  UpdatePostInput,
  CreateCommentInput,
  UpdateCommentInput,
  VoteInput,
} from '@/types/api/forum.types';

const BASE_URL = '/api/v1';

// Posts
export const forumApi = {
  // Get posts list with filters
  getPosts: async (params: PostsQueryParams = {}): Promise<PaginatedResponse<Post>> => {
    const response = await apiClient.get(`${BASE_URL}/posts`, { params });
    return response.data;
  },

  // Get single post by ID
  getPost: async (id: string): Promise<Post> => {
    const response = await apiClient.get(`${BASE_URL}/posts/${id}`);
    return response.data;
  },

  // Create new post
  createPost: async (data: CreatePostInput): Promise<Post> => {
    const response = await apiClient.post(`${BASE_URL}/posts`, data);
    return response.data;
  },

  // Update post
  updatePost: async (id: string, data: UpdatePostInput): Promise<Post> => {
    const response = await apiClient.put(`${BASE_URL}/posts/${id}`, data);
    return response.data;
  },

  // Delete post
  deletePost: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/posts/${id}`);
  },

  // Publish post
  publishPost: async (id: string): Promise<Post> => {
    const response = await apiClient.post(`${BASE_URL}/posts/${id}/publish`);
    return response.data;
  },

  // Pin post (moderator only)
  pinPost: async (id: string): Promise<Post> => {
    const response = await apiClient.post(`${BASE_URL}/posts/${id}/pin`);
    return response.data;
  },

  // Vote on post
  votePost: async (id: string, voteType: VoteInput['voteType']): Promise<void> => {
    await apiClient.post(`${BASE_URL}/posts/${id}/vote`, { voteType });
  },

  // Bookmark post
  bookmarkPost: async (id: string): Promise<void> => {
    await apiClient.post(`${BASE_URL}/posts/${id}/bookmark`);
  },

  // Remove bookmark
  unbookmarkPost: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/posts/${id}/bookmark`);
  },

  // Report post
  reportPost: async (id: string, reason: string): Promise<void> => {
    await apiClient.post(`${BASE_URL}/posts/${id}/report`, { reason });
  },

  // Comments
  getComments: async (postId: string): Promise<Comment[]> => {
    const response = await apiClient.get(`${BASE_URL}/posts/${postId}/comments`);
    return response.data;
  },

  createComment: async (data: CreateCommentInput): Promise<Comment> => {
    const response = await apiClient.post(`${BASE_URL}/comments/posts/${data.postId}`, data);
    return response.data;
  },

  updateComment: async (id: string, data: UpdateCommentInput): Promise<Comment> => {
    const response = await apiClient.put(`${BASE_URL}/comments/${id}`, data);
    return response.data;
  },

  deleteComment: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/comments/${id}`);
  },

  voteComment: async (id: string, voteType: VoteInput['voteType']): Promise<void> => {
    await apiClient.post(`${BASE_URL}/comments/${id}/vote`, { voteType });
  },

  acceptComment: async (id: string): Promise<Comment> => {
    const response = await apiClient.post(`${BASE_URL}/comments/${id}/accept`);
    return response.data;
  },

  // Tags
  getTags: async (): Promise<Tag[]> => {
    const response = await apiClient.get(`${BASE_URL}/tags`);
    return response.data;
  },

  getPopularTags: async (): Promise<Tag[]> => {
    const response = await apiClient.get(`${BASE_URL}/tags/popular`);
    return response.data;
  },

  // Categories
  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get(`${BASE_URL}/categories`);
    return response.data;
  },

  // Search
  searchPosts: async (query: string): Promise<Post[]> => {
    const response = await apiClient.get(`${BASE_URL}/search`, {
      params: { q: query, type: 'posts' },
    });
    return response.data;
  },
};
