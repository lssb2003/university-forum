import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { getThread, deleteThread, lockThread, moveThread, unlockThread } from '../../api/threads';
import { useAuth } from '../../contexts/AuthContext';
import { canModifyThread, canModerateCategory, canDeleteContent } from '../../utils/permissions';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorMessage from '../ui/ErrorMessage';
import PostList from '../posts/PostList';
import CreatePost from '../posts/CreatePost';
import EditThread from './EditThread';
import { getCategories } from '../../api/categories';
import EditedTimestamp from '../ui/EditedTimestamp';


const ThreadView: React.FC = () => {
    const { threadId } = useParams<{ threadId: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);
    const [isMoving, setIsMoving] = useState(false);
    const [targetCategoryId, setTargetCategoryId] = useState<number | null>(null);

    const { data: thread, isLoading: threadLoading, error: threadError } = useQuery({
        queryKey: ['thread', threadId],
        queryFn: () => getThread(Number(threadId)),
        retry: false // Don't retry if thread not found
    });


    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: getCategories,
        enabled: isMoving
    });

    const deleteMutation = useMutation({
        mutationFn: deleteThread,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['threads'] });
            queryClient.invalidateQueries({ queryKey: ['thread', threadId] });
            
            if (thread?.category_id) {
                navigate(`/categories/${thread.category_id}`, { replace: true });
            } else {
                navigate('/', { replace: true });
            }
        }
    });

    const lockMutation = useMutation({
        mutationFn: async (id: number) => {
            return thread?.is_locked ? unlockThread(id) : lockThread(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['thread', threadId] });
        }
    });

    const moveMutation = useMutation({
        mutationFn: ({ threadId, categoryId }: { threadId: number; categoryId: number }) => 
            moveThread(threadId, categoryId),
        onSuccess: (updatedThread) => {
            queryClient.setQueryData(['thread', threadId], updatedThread);
            queryClient.invalidateQueries({ queryKey: ['threads'] });
            setIsMoving(false);
            navigate(`/categories/${updatedThread.category_id}`);
        }
    });

    if (threadLoading) return <LoadingSpinner />;
    if (threadError || !thread) {  // Add !thread check here
        return (
            <div className="min-h-screen bg-gradient-to-b from-blue-50 to-orange-50">
                <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Content Not Found</h2>
                        <p className="text-gray-600 mb-6">
                            The content you're looking for might have been deleted or doesn't exist.
                        </p>
                        <button
                            onClick={() => navigate(-1)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const canModify = canModifyThread(user, thread.author_id, thread.category_id);
    const canDelete = canDeleteContent(user, thread.author_id, thread.category_id);
    const hasModeratorAccess = user?.role === 'admin' || thread.can_moderate;

    const handleDeleteThread = async () => {
        if (!thread) return;
        
        if (window.confirm('Are you sure you want to delete this thread?')) {
            try {
                await deleteMutation.mutateAsync(thread.id);
            } catch (error) {
                console.error('Delete failed:', error);
            }
        }
    };

    const handleLockToggle = async () => {
        if (!thread) return;
        
        const action = thread.is_locked ? 'unlock' : 'lock';
        if (window.confirm(`Are you sure you want to ${action} this thread?`)) {
            try {
                await lockMutation.mutateAsync(thread.id);
            } catch (error) {
                console.error(`Failed to ${action} thread:`, error);
            }
        }
    };

    const handleMoveThread = async () => {
        if (!thread || !targetCategoryId) return;
        
        try {
            await moveMutation.mutateAsync({ 
                threadId: thread.id, 
                categoryId: targetCategoryId 
            });
        } catch (error) {
            console.error('Move failed:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-orange-50">
            <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                {/* Main Thread Content */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
                    {isEditing ? (
                        <EditThread 
                            thread={thread} 
                            onCancel={() => setIsEditing(false)} 
                        />
                    ) : (
                        <div className="p-8">
                            <div className="flex justify-between items-start">
                                <div className="flex-grow">
                                    <h1 className="text-3xl font-bold text-blue-900">{thread.title}</h1>
                                    <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
                                        <span className="flex items-center">
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            {thread.author.email}
                                        </span>
                                        <span>•</span>
                                        <span className="flex items-center">
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {new Date(thread.created_at).toLocaleDateString()}
                                        </span>
                                        {/* Add EditedTimestamp here */}
                                        {thread.edited_at && (
                                            <>
                                                <span>•</span>
                                                <EditedTimestamp editedAt={thread.edited_at} />
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="flex space-x-2 ml-4">
                                    {canModify && (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 
                                                    transition-colors duration-200"
                                        >
                                            Edit
                                        </button>
                                    )}
                                    {canDelete && (
                                        <button
                                            onClick={handleDeleteThread}
                                            disabled={deleteMutation.isPending}
                                            className="px-3 py-1 text-sm text-orange-500 hover:text-orange-700 
                                                    transition-colors duration-200"
                                        >
                                            Delete
                                        </button>
                                    )}
                                    {hasModeratorAccess && (
                                        <>
                                            <button
                                                onClick={handleLockToggle}
                                                disabled={lockMutation.isPending}
                                                className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 
                                                         transition-colors duration-200 flex items-center"
                                            >
                                                {thread.is_locked ? (
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                    </svg>
                                                )}
                                                {lockMutation.isPending ? 'Processing...' : thread.is_locked ? 'Unlock' : 'Lock'}
                                            </button>
                                            <button
                                                onClick={() => setIsMoving(true)}
                                                className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 
                                                         transition-colors duration-200"
                                            >
                                                Move
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6 prose max-w-none text-gray-700">
                                {thread.content}
                                {thread.edited_at && (
                                    <div className="mt-2 text-xs text-gray-500 italic">
                                    edited {new Date(thread.edited_at).toLocaleString()}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Move Thread Dialog */}
                {isMoving && hasModeratorAccess && (
                    <div className="mb-8 bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-xl font-semibold text-blue-900 mb-4">Move Thread</h3>
                        <select
                            className="w-full p-2 border border-gray-300 rounded-lg focus:border-blue-500 
                                     focus:ring-2 focus:ring-blue-500"
                            onChange={(e) => setTargetCategoryId(Number(e.target.value))}
                            value={targetCategoryId || ''}
                        >
                            <option value="">Select category...</option>
                            {categories?.map(category => (
                                <option 
                                    key={category.id} 
                                    value={category.id}
                                    disabled={category.id === thread.category_id}
                                >
                                    {category.name}
                                </option>
                            ))}
                        </select>
                        <div className="mt-4 flex justify-end space-x-3">
                            <button
                                onClick={() => setIsMoving(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleMoveThread}
                                disabled={!targetCategoryId || moveMutation.isPending}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                                         disabled:opacity-50 transition-colors"
                            >
                                {moveMutation.isPending ? 'Moving...' : 'Move'}
                            </button>
                        </div>
                        {moveMutation.error && (
                            <p className="mt-2 text-sm text-red-600">
                                Failed to move thread. Please try again.
                            </p>
                        )}
                    </div>
                )}

                {/* Posts Section */}
                {!thread.is_locked ? (
                    <>
                        <PostList 
                            threadId={Number(threadId)}
                            categoryId={thread.category_id}
                        />
                        {user && (
                            <div className="mt-8">
                                <CreatePost 
                                    threadId={Number(threadId)}
                                />
                            </div>
                        )}
                    </>
                ) : (
                    <div className="mt-8 p-4 bg-orange-50 border border-orange-200 text-orange-700 rounded-lg 
                                    flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        This thread has been locked and no new replies can be added.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ThreadView;