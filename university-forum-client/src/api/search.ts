import api from './client';
import { SearchResults, SearchSuggestionsResponse, SearchParams } from '../types/search';

export const searchContent = async (params: SearchParams): Promise<SearchResults> => {
    const response = await api.get('/search', { params });
    return response.data;
};

export const getSearchSuggestions = async (params: SearchParams): Promise<SearchSuggestionsResponse> => {
    const response = await api.get('/search/suggestions', { params });
    return response.data;
};
