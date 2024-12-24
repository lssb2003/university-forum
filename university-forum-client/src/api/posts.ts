import api from './client';
import { Post } from '../types';

export const getPosts = async (threadId: number, highlightPostId?: number): Promise<Post[]> => {
    const params = new URLSearchParams();
    if (highlightPostId) {
        params.append('highlight_post_id', highlightPostId.toString());
    }
    const queryString = params.toString();
    const url = queryString ? 
        `/threads/${threadId}/posts?${queryString}` : 
        `/threads/${threadId}/posts`;
    
    const response = await api.get(url);
    return response.data;
};

export const createPost = async (threadId: number, data: { 
    content: string;
    parent_id?: number | null;
}): Promise<Post> => {
    const response = await api.post(`/threads/${threadId}/posts`, data);
    return response.data;
};

export const updatePost = async (postId: number, content: string): Promise<Post> => {
    const response = await api.put(`/posts/${postId}`, { content });
    return response.data;
};

export const deletePost = async (postId: number): Promise<void> => {
    await api.delete(`/posts/${postId}`);
};

export const restorePost = async (postId: number): Promise<Post> => {
    const response = await api.put(`/posts/${postId}/restore`);
    return response.data;
};
