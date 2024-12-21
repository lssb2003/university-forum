import api from './client';
import { SearchResults, SearchSuggestionsResponse, SearchParams } from '../types/search';

export const searchContent = async (params: SearchParams): Promise<SearchResults> => {
    const queryParams = new URLSearchParams();
    queryParams.append('q', params.q);
    if (params.context_type && params.context_type !== 'global') {
        queryParams.append('context_type', params.context_type);
    }
    if (params.context_id) {
        queryParams.append('context_id', params.context_id.toString());
    }
    
    const response = await api.get(`/search?${queryParams.toString()}`);
    return response.data;
};



export const getSearchSuggestions = async (params: SearchParams): Promise<SearchSuggestionsResponse> => {
    const response = await api.get('/search/suggestions', { params });
    return response.data;
};
