import api from './client';
import { Post } from '../types';

export const getPosts = async (threadId: number): Promise<Post[]> => {
    const response = await api.get(`/threads/${threadId}/posts`);
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
