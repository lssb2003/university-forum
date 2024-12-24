import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { searchContent } from '../../api/search';
import { 
    CategorySearchResult,
    ThreadSearchResult,
    PostSearchResult,
    SearchResults as SearchResultsType 
} from '../../types/search';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorMessage from '../ui/ErrorMessage';

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';

    const { data, isLoading, error } = useQuery<SearchResultsType>({
        queryKey: ['search', query],
        queryFn: () => searchContent({ q: query }),
        enabled: query.length > 0
    });

    if (!query) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-blue-50 to-orange-50 py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
                    Enter a search term to begin
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-blue-50 to-orange-50 py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <LoadingSpinner />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-blue-50 to-orange-50 py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <ErrorMessage message="Failed to load search results" />
                </div>
            </div>
        );
    }

    const totalResults = 
        (data?.categories?.length || 0) + 
        (data?.threads?.length || 0) + 
        (data?.posts?.length || 0);

    if (totalResults === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-blue-50 to-orange-50 py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-blue-900 mb-4">
                        No results found
                    </h2>
                    <p className="text-gray-600">
                        No matches found for "{query}"
                    </p>
                </div>
            </div>
        );
    }

    const renderCategoryResult = (category: CategorySearchResult) => (
        <Link
            key={`category-${category.id}`}
            to={`/categories/${category.id}`}
            className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow 
                        duration-200 overflow-hidden border-l-4 border-blue-600"
        >
            <div className="p-6">
                <h4 className="text-lg font-semibold text-blue-900">{category.name}</h4>
                <p className="mt-2 text-gray-600">{category.description}</p>
            </div>
        </Link>
    );

    const renderThreadResult = (thread: ThreadSearchResult) => (
        <Link
            key={`thread-${thread.id}`}
            to={`/threads/${thread.id}`}
            className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow 
                        duration-200 overflow-hidden border-l-4 border-blue-600"
        >
            <div className="p-6">
                <h4 className="text-lg font-semibold text-blue-900">{thread.title}</h4>
                <p className="mt-2 text-gray-600">{thread.content}</p>
                <div className="mt-2 text-sm text-gray-500">
                    by {thread.author.email}
                </div>
            </div>
        </Link>
    );

    const renderPostResult = (post: PostSearchResult) => {
        // Add validation to ensure thread_id is a valid number
        if (!post.thread_id || isNaN(post.thread_id)) {
            console.error('Invalid thread_id for post:', post);
            return null;
        }

        return (
            <Link
                key={`post-${post.id}`}
                to={`/threads/${post.thread_id}#post-${post.id}`}
                className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow 
                          duration-200 overflow-hidden border-l-4 border-blue-600"
            >
                <div className="p-6">
                    <p className="text-gray-600">{post.content}</p>
                    <div className="mt-2 text-sm text-gray-500">
                        by {post.author.email} in thread #{post.thread_id}
                    </div>
                </div>
            </Link>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-orange-50">
            <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-blue-900">
                        Search Results
                    </h2>
                    <p className="mt-2 text-gray-600">
                        {totalResults} results found for "{query}"
                    </p>
                </div>

                {/* Categories */}
                {data?.categories && data.categories.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-xl font-semibold text-blue-800 mb-4">Categories</h3>
                        <div className="space-y-4">
                            {data.categories.map(renderCategoryResult)}
                        </div>
                    </div>
                )}

                {/* Threads */}
                {data?.threads && data.threads.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-xl font-semibold text-blue-800 mb-4">Threads</h3>
                        <div className="space-y-4">
                            {data.threads.map(renderThreadResult)}
                        </div>
                    </div>
                )}

                {/* Posts */}
                {data?.posts && data.posts.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-xl font-semibold text-blue-800 mb-4">Posts</h3>
                        <div className="space-y-4">
                            {data.posts
                                .filter(post => post.thread_id && !isNaN(post.thread_id))
                                .map(renderPostResult)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchResults;