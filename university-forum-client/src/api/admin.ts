// src/api/admin.ts
import api from './client';
import { User, ModeratorAssignment, Category } from '../types';

export const getUsers = async (): Promise<User[]> => {
    const response = await api.get('/admin/users');
    return response.data;
};

export const updateUserRole = async (userId: number, role: string): Promise<User> => {
    const response = await api.put(`/admin/users/${userId}/update_role`, { role });
    return response.data;
};

export const assignModerator = async (userId: number, categoryId: number): Promise<ModeratorAssignment> => {
    try {
        const response = await api.post('/admin/moderators', {
            moderator: {
                user_id: userId,
                category_id: categoryId
            }
        });
        return response.data;
    } catch (error: any) {
        throw error.response?.data || error;
    }
};


export const removeModerator = async (moderatorId: number): Promise<void> => {
    await api.delete(`/admin/moderators/${moderatorId}`);
};

// Category management exports
export const createCategory = async (data: {
    name: string;
    description: string;
    parent_category_id?: number | null;
}): Promise<Category> => {
    const response = await api.post('/admin/categories', { category: data });
    return response.data;
};

export const updateCategory = async (categoryId: number, data: {
    name: string;
    description: string;
    parent_category_id?: number | null;
}): Promise<Category> => {
    const response = await api.put(`/admin/categories/${categoryId}`, { category: data });
    return response.data;
};

export const deleteCategory = async (categoryId: number): Promise<void> => {
    await api.delete(`/admin/categories/${categoryId}`);
};


export const banUser = async (userId: number, reason: string): Promise<User> => {
    const response = await api.post(`/admin/users/${userId}/ban`, { reason });
    return response.data;
};

export const unbanUser = async (userId: number): Promise<User> => {
    const response = await api.post(`/admin/users/${userId}/unban`);
    return response.data;
};