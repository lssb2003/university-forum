import React, { useState, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getSearchSuggestions } from '../../api/search';
import { SearchSuggestion } from '../../types/search';
import debounce from 'lodash/debounce';

interface SearchBarProps {
    onSearch?: (query: string) => void;
    className?: string;
}

interface SearchContext {
    type: 'global' | 'category' | 'thread';
    id?: number;
    name?: string;
}

const SearchBar = React.forwardRef<HTMLDivElement, SearchBarProps>(({ 
    onSearch, 
    className = '' 
}, ref) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const localRef = useRef<HTMLDivElement>(null);
    const wrapperRef = (ref as React.RefObject<HTMLDivElement>) || localRef;

    // Determine current context based on URL
    const getSearchContext = (): SearchContext => {
        const pathParts = location.pathname.split('/');
        if (pathParts.includes('categories') && pathParts.length > 2) {
            return {
                type: 'category',
                id: parseInt(pathParts[2]),
                name: document.title.split(' - ')[0] // Get category name from page title
            };
        }
        if (pathParts.includes('threads') && pathParts.length > 2) {
            return {
                type: 'thread',
                id: parseInt(pathParts[2]),
                name: document.title.split(' - ')[0] // Get thread name from page title
            };
        }
        return { type: 'global' };
    };

    const currentContext = getSearchContext();

    // Fetch suggestions with context
    const { data: suggestionsData } = useQuery({
        queryKey: ['searchSuggestions', searchQuery, currentContext],
        queryFn: () => getSearchSuggestions({ 
            q: searchQuery,
            context_type: currentContext.type,
            context_id: currentContext.id
        }),
        enabled: searchQuery.length >= 2,
        staleTime: 5000
    });

    const debouncedSetQuery = useCallback(
        debounce((value: string) => setSearchQuery(value), 300),
        []
    );

    const getPlaceholderText = () => {
        switch (currentContext.type) {
            case 'category':
                return `Search in ${currentContext.name || 'this category'}...`;
            case 'thread':
                return `Search in ${currentContext.name || 'this thread'}...`;
            default:
                return 'Search forums...';
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setIsOpen(false);
        if (searchQuery.trim()) {
            const searchParams = new URLSearchParams({
                q: searchQuery.trim(),
                ...(currentContext.type !== 'global' && {
                    context_type: currentContext.type,
                    context_id: currentContext.id?.toString() || ''
                })
            });
            navigate(`/search?${searchParams.toString()}`);
            onSearch?.(searchQuery.trim());
        }
    };

    // Close suggestions when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [wrapperRef]);

    return (
        <div ref={wrapperRef} className={`relative ${className}`}>
            <form onSubmit={handleSearch} className="relative">
                <input
                    type="text"
                    onChange={(e) => {
                        debouncedSetQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    placeholder={getPlaceholderText()}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 
                                focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                             pl-10" // Added left padding for the icon
                />
                {/* Context Icon */}
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    {currentContext.type === 'category' ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                    ) : currentContext.type === 'thread' ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                    ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    )}
                </div>
                <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 
                                text-gray-400 hover:text-gray-600"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </button>
            </form>

            {/* Suggestions dropdown */}
            {isOpen && suggestionsData?.suggestions && suggestionsData.suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg 
                                border border-gray-200 max-h-96 overflow-y-auto">
                    {suggestionsData.suggestions.map((suggestion) => (
                        <button
                            key={`${suggestion.type}-${suggestion.id}`}
                            onClick={() => {
                                setIsOpen(false);
                                navigate(`/search?q=${encodeURIComponent(suggestion.text)}`);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-blue-50 
                                        flex items-center space-x-2"
                        >
                            {/* Suggestion type icon */}
                            <span className="text-gray-400">
                                {suggestion.type === 'category' ? (
                                    <svg className="w-4 h-4" fill="none" strokeLinecap="round" 
                                            strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" 
                                            stroke="currentColor">
                                        <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                    </svg>
                                ) : suggestion.type === 'thread' ? (
                                    <svg className="w-4 h-4" fill="none" strokeLinecap="round" 
                                            strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" 
                                            stroke="currentColor">
                                        <path d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" strokeLinecap="round" 
                                            strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" 
                                            stroke="currentColor">
                                        <path d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                                    </svg>
                                )}
                            </span>
                            <span className="flex-grow line-clamp-1">{suggestion.text}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
});

SearchBar.displayName = 'SearchBar';

export default SearchBar;