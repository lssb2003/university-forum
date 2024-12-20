// src/components/posts/CreatePost.tsx
import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPost } from '../../api/posts';
import { useForm } from 'react-hook-form';
import ErrorMessage from '../ui/ErrorMessage';

interface CreatePostProps {
    threadId: number;
    parentId?: number | null;
}

interface PostFormData {
    content: string;
}

const CreatePost: React.FC<CreatePostProps> = ({ threadId, parentId }) => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<PostFormData>();
    const queryClient = useQueryClient();

    const createPostMutation = useMutation({
        mutationFn: (data: PostFormData) => 
            createPost(threadId, { 
                content: data.content,
                parent_id: parentId 
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts', threadId.toString()] });
            reset();
        },
    });

    const onSubmit = (data: PostFormData) => {
        createPostMutation.mutate(data);
    };

    return (
        <div className="mt-6 bg-white shadow-sm rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
                {parentId ? 'Write a Reply' : 'Reply to Thread'}
            </h3>
            {createPostMutation.error && (
                <ErrorMessage message="Failed to create post" />
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <textarea
                        {...register('content', {
                            required: 'Content is required',
                            minLength: {
                                value: 5,
                                message: 'Content must be at least 5 characters'
                            }
                        })}
                        rows={4}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                        placeholder="Write your reply..."
                    />
                    {errors.content && (
                        <p className="mt-2 text-sm text-red-600">{errors.content.message}</p>
                    )}
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={createPostMutation.isPending}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {createPostMutation.isPending ? 'Posting...' : 'Post Reply'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreatePost;