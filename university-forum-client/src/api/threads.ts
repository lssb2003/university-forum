// src/api/threads.ts
import api from './client';
import { Thread } from '../types';

// Get all threads in a category - returns array
export const getThreads = async (categoryId: number): Promise<Thread[]> => {
    const response = await api.get(`/categories/${categoryId}/threads`);
    return response.data;
};

// Get single thread - returns single thread
export const getThread = async (threadId: number): Promise<Thread> => {
    const response = await api.get(`/threads/${threadId}`);
    return response.data;
};

// Create thread
export const createThread = async (categoryId: number, data: {
    title: string;
    content: string;
}): Promise<Thread> => {
    const response = await api.post(`/categories/${categoryId}/threads`, data);
    return response.data;
};


export const updateThread = async (threadId: number, data: {
    title: string;
    content: string;
}): Promise<Thread> => {
    try {
        const response = await api.put(`/threads/${threadId}`, data);
        return response.data;
    } catch (error: any) {
        console.error('Update thread error:', error.response?.data);
        throw error;
    }
};


export const deleteThread = async (threadId: number): Promise<void> => {
    await api.delete(`/threads/${threadId}`);
};

export const lockThread = async (threadId: number): Promise<Thread> => {
    console.log('Making lock request for thread:', threadId); // Add this
    const response = await api.post(`/threads/${threadId}/lock`);
    return response.data;
};


export const unlockThread = async (threadId: number): Promise<Thread> => {
    const response = await api.post(`/threads/${threadId}/unlock`);  // Use /threads/
    return response.data;
};



export const moveThread = async (threadId: number, categoryId: number): Promise<Thread> => {
    try {
        const response = await api.put(`/threads/${threadId}/move`, { 
            category_id: categoryId 
        });
        return response.data;
    } catch (error: any) {
        console.error('Move thread error:', error.response?.data);
        throw error;
    }
};

export const flagThread = async (threadId: number, reason: string): Promise<void> => {
    await api.post(`/threads/${threadId}/flag`, { reason });
};