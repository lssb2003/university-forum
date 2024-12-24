import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createThread } from '../../api/threads';
import { useForm } from 'react-hook-form';
import ErrorMessage from '../ui/ErrorMessage';
import { useAuth } from '../../contexts/AuthContext';

interface ThreadFormData {
    title: string;
    content: string;
}

const CreateThread: React.FC = () => {
    const { categoryId } = useParams<{ categoryId: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { register, handleSubmit, formState: { errors } } = useForm<ThreadFormData>();
    const { user } = useAuth();

    const createThreadMutation = useMutation({
        mutationFn: (data: ThreadFormData) => 
            createThread(Number(categoryId), data),
        onSuccess: (newThread) => {
            queryClient.invalidateQueries({ queryKey: ['threads', categoryId] });
            // Use replace: true to prevent back navigation to the creation form
            navigate(`/threads/${newThread.id}`, { replace: true });
        },
    });
    

    const onSubmit = (data: ThreadFormData) => {
        createThreadMutation.mutate(data);
    };

    const handleCancel = () => {
        // Use replace: true here as well to prevent back navigation to the creation form
        navigate(`/categories/${categoryId}`, { replace: true });
    };

    React.useEffect(() => {
        if (user?.banned_at) {
            navigate('/');
        }
    }, [user, navigate]);

    if (user?.banned_at) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-blue-50 to-orange-50">
                <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-sm text-red-600">
                            Your account is currently restricted and cannot create new content.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-orange-50">
            <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-xl shadow-lg p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-blue-900">Create New Thread</h2>
                        <p className="mt-2 text-gray-600">Start a new discussion in this category</p>
                    </div>

                    {createThreadMutation.error && (
                        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                            Failed to create thread
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Thread Title
                            </label>
                            <input
                                {...register('title', {
                                    required: 'Title is required',
                                    minLength: {
                                        value: 3,
                                        message: 'Title must be at least 3 characters'
                                    }
                                })}
                                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2
                                            shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.title && (
                                <p className="mt-2 text-sm text-red-600">{errors.title.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Thread Content
                            </label>
                            <textarea
                                {...register('content', {
                                    required: 'Content is required',
                                    minLength: {
                                        value: 10,
                                        message: 'Content must be at least 10 characters'
                                    }
                                })}
                                rows={8}
                                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2
                                            shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.content && (
                                <p className="mt-2 text-sm text-red-600">{errors.content.message}</p>
                            )}
                        </div>

                        <div className="flex justify-end space-x-4 pt-4">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 
                                            hover:bg-gray-50 transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={createThreadMutation.isPending}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                                            disabled:opacity-50 transition-colors duration-200"
                            >
                                {createThreadMutation.isPending ? 'Creating...' : 'Create Thread'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};


export default CreateThread;
