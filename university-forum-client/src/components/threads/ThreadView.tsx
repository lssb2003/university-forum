import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getThread, deleteThread, lockThread, moveThread, unlockThread } from '../../api/threads';
import { useAuth } from '../../contexts/AuthContext';
import { canModifyThread, canDeleteContent } from '../../utils/permissions';
import LoadingSpinner from '../ui/LoadingSpinner';
import PostList from '../posts/PostList';
import CreatePost from '../posts/CreatePost';
import EditThread from './EditThread';
import { getCategories } from '../../api/categories';
import MoveThreadDialog from './MoveThreadDialog';
import { getPosts } from '../../api/posts';
import { Post } from '../../types';

const findPostInTree = (posts: Post[] | undefined, targetId: number): boolean => {
    if (!posts) return false;
    
    for (const post of posts) {
        // Check current post
        if (post.id === targetId) return true;
        
        // Check replies recursively
        if (post.replies && findPostInTree(post.replies, targetId)) {
            return true;
        }
    }
    
    return false;
};


const ThreadView: React.FC = () => {
    const { threadId } = useParams<{ threadId: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);
    const [isMoving, setIsMoving] = useState(false);
    const location = useLocation();
    const postListRef = useRef<HTMLDivElement>(null);

    const initialHighlightRef = useRef<{
        postId: number | null;
        handled: boolean;
    }>({ postId: null, handled: false });

    const postId = location.hash ? parseInt(location.hash.replace('#post-', '')) : null;

    useEffect(() => {
        if (postId !== initialHighlightRef.current.postId) {
            initialHighlightRef.current = {
                postId: postId,
                handled: false
            };
        }
    }, [postId]);

    

    const { data: thread, isLoading: threadLoading, error: threadError } = useQuery({
        queryKey: ['thread', threadId],
        queryFn: () => getThread(Number(threadId)),
        retry: false // Don't retry if thread not found
    });

    const { data: posts, isLoading: postsLoading } = useQuery({
        queryKey: ['posts', threadId, postId],
        queryFn: () => getPosts(Number(threadId), postId || undefined),
        enabled: !!thread
    });

    useEffect(() => {
        if (!postsLoading && posts) {
            console.log('Posts loaded:', posts.length);
            if (postId) {
                const found = findPostInTree(posts, postId);
                console.log('Target post found:', found);
            }
        }
    }, [posts, postsLoading, postId]);

    useEffect(() => {
        if (postId && !postsLoading && posts) {
            const found = findPostInTree(posts, postId);
            console.log('Target post found:', found);

            // Only proceed if post is found and we haven't handled this postId yet
            if (found && !initialHighlightRef.current.handled) {
                const scrollToPost = () => {
                    const postElement = document.getElementById(`post-${postId}`);
                    if (postElement) {
                        console.log('Post element found in DOM:', postId);
                        
                        // Ensure parent containers are visible
                        let current = postElement;
                        while (current && current.parentElement) {
                            if (current.style.display === 'none') {
                                current.style.display = 'block';
                            }
                            current = current.parentElement;
                        }

                        // Scroll into view
                        postElement.scrollIntoView({ behavior: 'smooth' });
                        
                        // Apply highlight
                        postElement.classList.add('bg-orange-200', 'transition-colors', 'duration-1000');
                        setTimeout(() => {
                            postElement.classList.remove('bg-orange-200');
                            // Mark as handled after highlight is complete
                            initialHighlightRef.current.handled = true;
                        }, 2000);
                        
                    } else {
                        console.log('Post element not found in DOM:', postId);
                    }
                };

                // Initial attempt
                scrollToPost();
                
                // Retry with delays
                const retryTimes = [100, 250, 500, 1000];
                const retryTimeouts = retryTimes.map(delay => 
                    setTimeout(scrollToPost, delay)
                );

                // Cleanup timeouts
                return () => {
                    retryTimeouts.forEach(timeout => clearTimeout(timeout));
                };
            }
        }
    }, [postId, posts, postsLoading]);

    useEffect(() => {
        return () => {
            initialHighlightRef.current = {
                postId: null,
                handled: false
            };
        };
    }, []);


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

    

    if (threadLoading || (postId && postsLoading)) {
        return <LoadingSpinner />;
    }

    if (threadError || (postId && !postsLoading && posts && !findPostInTree(posts, postId))) {
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
    


    if (!thread) return null;

    const canModify = canModifyThread(user, thread.author_id, thread.category_id);
    const canDelete = canDeleteContent(user, thread.author_id, thread.category_id);
    const hasModeratorAccess = 
        user && !user.banned_at &&  // Add banned check
        (user.role === 'admin' || 
            (user.role === 'moderator' && thread.can_moderate));

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

    const handleMoveThread = async (categoryId: number) => {
        if (!thread) return;
        
        try {
            await moveMutation.mutateAsync({ 
                threadId: thread.id, 
                categoryId
            });
        } catch (error) {
            console.error('Move failed:', error);
            throw error; // Let the dialog handle the error
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
                            {thread.edited_at && thread.created_at !== thread.edited_at && (
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
                    <MoveThreadDialog
                        isOpen={isMoving}
                        onClose={() => setIsMoving(false)}
                        onMove={handleMoveThread}
                        categories={categories || []}
                        currentCategoryId={thread.category_id}
                        userModeratedCategories={user?.role === 'admin' ? undefined : user?.moderated_categories}
                    />
                )}

                {/* Posts Section */}
                <div ref={postListRef}>

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
        </div>
    );
};

export default ThreadView;