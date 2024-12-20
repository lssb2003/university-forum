import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getSearchSuggestions } from '../../api/search';
import { SearchSuggestion } from '../../types/search';
import debounce from 'lodash/debounce';  // Fixed lodash import

interface SearchBarProps {
    onSearch?: (query: string) => void;
    className?: string;
}

const SearchBar = React.forwardRef<HTMLDivElement, SearchBarProps>(({ 
    onSearch, 
    className = '' 
}, ref) => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const localRef = useRef<HTMLDivElement>(null);
    const wrapperRef = (ref as React.RefObject<HTMLDivElement>) || localRef;

    // Fetch suggestions with debounced query
    const { data: suggestionsData } = useQuery({
        queryKey: ['searchSuggestions', searchQuery],
        queryFn: () => getSearchSuggestions({ q: searchQuery }),
        enabled: searchQuery.length >= 2,
        staleTime: 5000 // 5 seconds
    });

    const debouncedSetQuery = useCallback(
        debounce((value: string) => setSearchQuery(value), 300),
        []
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        debouncedSetQuery(value);
        setIsOpen(true);
    };

    const handleSuggestionClick = (suggestion: SearchSuggestion) => {
        setIsOpen(false);
        navigate(`/search?q=${encodeURIComponent(suggestion.text)}`);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setIsOpen(false);
        if (searchQuery.trim()) {
            onSearch?.(searchQuery.trim());
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
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
                    onChange={handleInputChange}
                    placeholder="Search..."
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                        />
                    </svg>
                </button>
            </form>

            {/* Suggestions dropdown */}
            {isOpen && suggestionsData?.suggestions && suggestionsData.suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
                    {suggestionsData.suggestions.map((suggestion) => (
                        <button
                            key={`suggestion-${suggestion.type}-${suggestion.id}`}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="w-full px-4 py-2 text-left hover:bg-blue-50 flex items-center space-x-2"
                        >
                            {/* Icon based on type */}
                            <span className="text-gray-400">
                                {suggestion.type === 'category' ? (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            strokeWidth={2} 
                                            d="M4 6h16M4 12h16M4 18h16" 
                                        />
                                    </svg>
                                ) : suggestion.type === 'thread' ? (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            strokeWidth={2} 
                                            d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" 
                                        />
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            strokeWidth={2} 
                                            d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" 
                                        />
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