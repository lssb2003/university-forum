import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { getThread, updateThread } from '../../api/threads';
import { useForm } from 'react-hook-form';
import { Thread } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { canModifyThread } from '../../utils/permissions';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorMessage from '../ui/ErrorMessage';

interface EditThreadProps {
    thread?: Thread;
    onCancel?: () => void;
}

interface ThreadFormData {
    title: string;
    content: string;
}

const EditThread: React.FC<EditThreadProps> = ({ thread: propThread, onCancel }) => {
    const { threadId } = useParams<{ threadId: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user } = useAuth();

    // Only fetch if we don't have the thread passed as prop
    const { data: fetchedThread, isLoading: threadLoading } = useQuery({
        queryKey: ['thread', threadId],
        queryFn: () => getThread(Number(threadId)),
        enabled: !propThread && !!threadId
    });

    const thread = propThread || fetchedThread;

    const { register, handleSubmit, formState: { errors } } = useForm<ThreadFormData>({
        defaultValues: thread ? {
            title: thread.title,
            content: thread.content
        } : undefined
    });

    const updateMutation = useMutation({
        mutationFn: (data: ThreadFormData) => {
            if (!thread) throw new Error("Thread not found");
            return updateThread(thread.id, data);
        },
        onSuccess: (updatedThread) => {
            // Update all related caches
            queryClient.setQueryData(
                ['thread', thread?.id.toString()], 
                updatedThread
            );
            queryClient.invalidateQueries({ 
                queryKey: ['threads', thread?.category_id.toString()] 
            });
            
            if (onCancel) {
                onCancel();
            } else {
                // Replace current history entry instead of adding to it
                navigate(`/threads/${thread?.id}`, { replace: true });
            }
        }
    });

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else {
            // Also replace the history entry when canceling
            navigate(`/threads/${thread?.id}`, { replace: true });
        }
    };

    if (threadLoading) return <LoadingSpinner />;
    if (!thread) return <ErrorMessage message="Thread not found" />;
    
    // Check permissions
    if (!user || !canModifyThread(user, thread.author_id, thread.category_id)) {
        return <ErrorMessage message="Unauthorized" />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-orange-50">
            <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-xl shadow-lg p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-blue-900">
                            Edit Thread
                        </h2>
                    </div>

                    {updateMutation.error && (
                        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
                            Failed to update thread
                        </div>
                    )}

                    <form onSubmit={handleSubmit((data) => updateMutation.mutate(data))} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Title
                            </label>
                            <input
                                {...register('title', { required: 'Title is required' })}
                                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2
                                            shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.title && (
                                <p className="mt-2 text-sm text-red-600">{errors.title.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Content
                            </label>
                            <textarea
                                {...register('content', { required: 'Content is required' })}
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
                                disabled={updateMutation.isPending}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                                            disabled:opacity-50 transition-colors duration-200"
                            >
                                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
export default EditThread;