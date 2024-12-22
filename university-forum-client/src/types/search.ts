import { User } from './index';

// Base search result interface
interface BaseSearchResult {
    id: number;
    url: string;
}

export interface CategorySearchResult extends BaseSearchResult {
    type: 'category';
    name: string;
    description: string;
}

export interface ThreadSearchResult extends BaseSearchResult {
    type: 'forum_thread';
    title: string;
    content: string;
    author: User;
    category_id: number;
}

export interface PostSearchResult extends BaseSearchResult {
    type: 'post';
    content: string;
    author: User;
    thread_id: number;
}

export type SearchResult = CategorySearchResult | ThreadSearchResult | PostSearchResult;

export interface SearchResults {
    categories: CategorySearchResult[];
    threads: ThreadSearchResult[];
    posts: PostSearchResult[];
}

export interface SearchSuggestion {
    id: number;
    text: string;
    type: 'category' | 'thread' | 'post';
    thread_id?: number;
}

export interface SearchSuggestionsResponse {
    suggestions: SearchSuggestion[];
}

export interface SearchParams {
    q: string;
    context_type?: 'global' | 'category' | 'thread';
    context_id?: number;
}

