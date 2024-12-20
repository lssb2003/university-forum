// src/components/posts/PostList.tsx
import React from 'react';
import { Post } from '../../types';
import PostItem from './PostItem';
import { useQuery } from '@tanstack/react-query';
import { getPosts } from '../../api/posts';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorMessage from '../ui/ErrorMessage';

interface PostListProps {
    threadId: number;
    categoryId: number;
}

const PostList: React.FC<PostListProps> = ({ threadId, categoryId }) => {
    const { data: posts, isLoading, error } = useQuery({
        queryKey: ['posts', threadId.toString()],
        queryFn: () => getPosts(threadId)
    });

    if (isLoading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message="Failed to load posts" />;

    return (
        <div className="space-y-6">
            {posts?.map((post) => (
                <PostItem
                    key={post.id}
                    post={post}
                    threadId={threadId}
                    categoryId={categoryId}
                />
            ))}
        </div>
    );
};

export default PostList;