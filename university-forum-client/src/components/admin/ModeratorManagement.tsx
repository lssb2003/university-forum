// src/components/admin/ModeratorManagement.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCategories } from '../../api/categories';
import { getUsers, assignModerator, removeModerator } from '../../api/admin';
import { Category, User, ModeratorAssignment } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { isAdmin } from '../../utils/permissions';
import ErrorMessage from '../ui/ErrorMessage';
import LoadingSpinner from '../ui/LoadingSpinner';

const ModeratorManagement: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [selectedUser, setSelectedUser] = useState<number | null>(null);
    const queryClient = useQueryClient();
    const { user } = useAuth();

    const { data: categories, isLoading: categoriesLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: getCategories
    });

    const { data: users, isLoading: usersLoading } = useQuery({
        queryKey: ['users'],
        queryFn: () => getUsers(),
        select: (users) => users.filter(u => u.role === 'moderator' || u.role === 'user')
    });

    const assignMutation = useMutation({
        mutationFn: (data: { userId: number; categoryId: number }) => 
            assignModerator(data.userId, data.categoryId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setSelectedUser(null);
            setSelectedCategory(null);
        },
        onError: (error) => {
            console.error('Failed to assign moderator:', error);
        }
    });

    const removeMutation = useMutation({
        mutationFn: removeModerator,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (error) => {
            console.error('Failed to remove moderator:', error);
        }
    });

    if (!isAdmin(user)) {
        return <ErrorMessage message="Unauthorized access" />;
    }

    if (categoriesLoading || usersLoading) return <LoadingSpinner />;

    const handleAssign = () => {
        if (selectedCategory && selectedUser) {
            assignMutation.mutate({ 
                userId: selectedUser, 
                categoryId: selectedCategory 
            });
        }
    };

    const handleRemove = async (moderatorId: number, categoryName: string) => {
        if (window.confirm(`Are you sure you want to remove this moderator from ${categoryName}?`)) {
            await removeMutation.mutateAsync(moderatorId);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-6">
            <h2 className="text-2xl font-bold mb-6">Manage Moderators</h2>

            {/* Assignment Form */}
            <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h3 className="text-lg font-medium mb-4">Assign New Moderator</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Category
                        </label>
                        <select
                            className="w-full border rounded-md p-2"
                            onChange={(e) => setSelectedCategory(Number(e.target.value))}
                            value={selectedCategory || ''}
                        >
                            <option value="">Choose category...</option>
                            {categories?.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select User
                        </label>
                        <select
                            className="w-full border rounded-md p-2"
                            onChange={(e) => setSelectedUser(Number(e.target.value))}
                            value={selectedUser || ''}
                        >
                            <option value="">Choose user...</option>
                            {users?.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.email} ({user.role})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="mt-4">
                    <button
                        onClick={handleAssign}
                        disabled={!selectedCategory || !selectedUser || assignMutation.isPending}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {assignMutation.isPending ? 'Assigning...' : 'Assign Moderator'}
                    </button>
                </div>
            </div>

            {/* Current Moderators List */}
            <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium mb-4">Current Moderators</h3>
                {categories?.map((category) => (
                    <div key={category.id} className="mb-6 last:mb-0">
                        <h4 className="font-medium text-lg mb-2">{category.name}</h4>
                        {category.moderators && category.moderators.length > 0 ? (
                            <div className="space-y-2">
                                {category.moderators.map((moderator) => (
                                    <div 
                                        key={moderator.id}
                                        className="flex justify-between items-center bg-gray-50 p-3 rounded"
                                    >
                                        <span>{moderator.user.email}</span>
                                        <button
                                            onClick={() => handleRemove(moderator.id, category.name)}
                                            className="text-red-600 hover:text-red-700"
                                            disabled={removeMutation.isPending}
                                        >
                                            {removeMutation.isPending ? 'Removing...' : 'Remove'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">No moderators assigned</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ModeratorManagement;