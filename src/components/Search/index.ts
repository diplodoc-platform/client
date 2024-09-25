import type {SearchConfig, WorkerApi, WorkerConfig} from './types';

import {createContext, useContext} from 'react';

export type {SearchConfig, WorkerConfig, WorkerApi};

export const SearchContext = createContext<SearchConfig | null | undefined>(null);

SearchContext.displayName = 'SearchContext';

export const SearchProvider = SearchContext.Provider;

export {Search} from './Search';

export function useSearch() {
    return useContext(SearchContext);
}
