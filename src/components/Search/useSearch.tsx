import type {SearchConfig, SearchData} from './types';

import {createContext, useContext} from 'react';

export const SearchContext = createContext<SearchConfig | SearchData | null | undefined>(null);

SearchContext.displayName = 'SearchContext';

export const SearchProvider = SearchContext.Provider;

export function useSearch() {
    return useContext(SearchContext);
}
