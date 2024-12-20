import api from './client';
import { Category } from '../types';

export const getCategories = async (): Promise<Category[]> => {
    const response = await api.get('/categories');
    return response.data;
};

export const getCategory = async (id: number): Promise<Category> => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
};
