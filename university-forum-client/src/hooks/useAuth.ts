import { useMutation, useQueryClient } from '@tanstack/react-query';
import { login, register, logout } from '../api/auth';
import { LoginCredentials, RegisterCredentials, AuthResponse } from '../types';

export const useLogin = () => {
    return useMutation<AuthResponse, Error, LoginCredentials>({
        mutationFn: async (credentials) => {
            const response = await login(credentials);
            // Log the moderated categories for debugging
            console.log('Login response:', {
                userId: response.user.id,
                role: response.user.role,
                moderatedCategories: response.user.moderated_categories
            });
            return response;
        },
    });
};

export const useRegister = () => {
    return useMutation<AuthResponse, Error, RegisterCredentials>({
        mutationFn: (credentials) => register(credentials),
    });
};

export const useLogout = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: logout,
        onSuccess: () => {
        queryClient.clear(); // Clear all queries after logout
        },
    });
};