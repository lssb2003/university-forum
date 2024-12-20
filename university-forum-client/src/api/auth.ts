import api from './client';
import { LoginCredentials, RegisterCredentials, AuthResponse } from '../types';

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    console.log('Login response:', response.data); // Add this log
    
    // If moderator, fetch their moderated categories
    if (response.data.user.role === 'moderator') {
        const moderatorResponse = await api.get(`/users/${response.data.user.id}/moderated_categories`);
        console.log('Moderator categories:', moderatorResponse.data); // Add this log
        response.data.user.moderated_categories = moderatorResponse.data;
    }
    
    return response.data;
};

export const register = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', credentials);
    return response.data;
};

export const logout = async (): Promise<void> => {
    await api.post('/auth/logout');
};

// New password reset functions
export const forgotPassword = async (email: string): Promise<void> => {
    await api.post('/auth/forgot-password', { email });
};

export const resetPassword = async (data: {
    current_password: string;
    new_password: string;
    password_confirmation: string;
}): Promise<void> => {
    await api.post('/auth/reset-password', data);
};