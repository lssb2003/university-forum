import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getThreads, deleteThread } from '../../api/threads';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { canModifyThread, canDeleteContent } from '../../utils/permissions';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorMessage from '../ui/ErrorMessage';
import { Thread } from '../../types';

const ThreadList: React.FC = () => {
    const { categoryId } = useParams<{ categoryId: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: threads, isLoading, error } = useQuery({
        queryKey: ['threads', categoryId],
        queryFn: () => categoryId ? getThreads(Number(categoryId)) : Promise.resolve([])
    });

    const deleteMutation = useMutation({
        mutationFn: deleteThread,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['threads', categoryId] });
            queryClient.invalidateQueries({ queryKey: ['thread'] });
        }
    });

    const handleDelete = async (threadId: number) => {
        if (window.confirm('Are you sure you want to delete this thread?')) {
            try {
                await deleteMutation.mutateAsync(threadId);
            } catch (error) {
                console.error('Delete failed:', error);
            }
        }
    };

    if (isLoading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message="Failed to load threads" />;

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-orange-50">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-blue-900">Discussion Threads</h2>
                        <p className="mt-2 text-gray-600">Browse all threads in this category</p>
                    </div>
                    {user && (
                        <Link
                            to={`/categories/${categoryId}/new-thread`}
                            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium 
                                     rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 
                                     focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            New Thread
                        </Link>
                    )}
                </div>

                <div className="space-y-4">
                    {threads?.map((thread) => {
                        const canEdit = canModifyThread(user, thread.author_id, thread.category_id);
                        const canDelete = canDeleteContent(user, thread.author_id, thread.category_id);

                        return (
                            <div key={thread.id} 
                                className="bg-white shadow-md rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg"
                            >
                                <div className="border-l-4 border-blue-600">
                                    <div className="p-6">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-grow">
                                                <Link
                                                    to={`/threads/${thread.id}`}
                                                    className="text-xl font-semibold text-blue-900 hover:text-blue-700 
                                                             transition-colors duration-200"
                                                >
                                                    {thread.title}
                                                </Link>
                                                <div className="mt-2 flex items-center text-sm text-gray-500">
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    {thread.author.email}
                                                    <span className="mx-2">•</span>
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    {new Date(thread.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                            
                                            {(canEdit || canDelete) && (
                                                <div className="flex space-x-2 ml-4">
                                                    {canEdit && (
                                                        <Link
                                                            to={`/threads/${thread.id}/edit`}
                                                            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 
                                                                     transition-colors duration-200"
                                                        >
                                                            Edit
                                                        </Link>
                                                    )}
                                                    {canDelete && (
                                                        <button
                                                            onClick={() => handleDelete(thread.id)}
                                                            className="px-3 py-1 text-sm text-orange-500 hover:text-orange-700 
                                                                     transition-colors duration-200"
                                                        >
                                                            Delete
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {thread.is_locked && (
                                            <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs 
                                                          font-medium bg-gray-100 text-gray-800">
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                                Locked
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {threads?.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">No threads yet in this category.</p>
                            {user && (
                                <p className="mt-2 text-gray-600">
                                    Be the first to{' '}
                                    <Link 
                                        to={`/categories/${categoryId}/new-thread`}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        start a discussion
                                    </Link>
                                    !
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ThreadList;