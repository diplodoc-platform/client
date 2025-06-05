import {ISearchResult, SearchSuggestPageItem} from '@diplodoc/components';

export interface AlgoliaQuerySettings {
    hitsPerPage?: number;
    facetFilters?: string[];
    attributesToRetrieve?: string[];
    attributesToHighlight?: string[];
    [key: string]: unknown;
}

export interface SearchConfig {
    api: string;
    link: string;
    lang: string;
    depth: number;
    provider?: 'local' | 'algolia';

    appId?: string;
    indexName?: string;
    searchKey?: string;
    querySettings?: AlgoliaQuerySettings;
}

export interface WorkerConfig {
    api?: string;
    base: string;
    mark: string;
    provider?: 'local' | 'algolia';

    appId?: string;
    indexName?: string;
    searchKey?: string;
    querySettings?: {
        [key: string]: unknown;
    };
}

export interface SearchResultItem {
    type: 'page';
    link: string;
    title: string;
    section?: string;
    description: string;
}

export interface WorkerApi {
    init?(): void | Promise<void>;
    suggest(query: string, count: number): Promise<SearchSuggestPageItem[] | SearchResultItem[]>;
    search(
        query: string,
        count: number,
        page: number,
    ): Promise<SearchSuggestPageItem[] | SearchResultItem[]>;
}

export type InitMessage = {
    type: 'init';
} & WorkerConfig;

export type SuggestMessage = {
    type: 'suggest';
    query: string;
    count?: number;
};

export type SearchMessage = {
    type: 'search';
    query: string;
    page?: number;
    count?: number;
};

export interface SearchProviderExtended {
    init(): void;
    suggest(query: string): Promise<ISearchResult[]>;
    search(query: string, page?: number, count?: number): Promise<ISearchResult[]>;
    link(query: string, page?: number): string | null;
}

export type Message = InitMessage | SuggestMessage | SearchMessage;

export type MessageType = Message['type'];

export interface SearchResultData extends Partial<ISearchResult> {
    title?: string;
    url?: string;
    link?: string;
    description?: string;
    content?: string;
    text?: string;
    section?: string;
    hierarchy?: {
        lvl0?: string;
        lvl1?: string;
    };
}

export interface FormattedSearchResultItem {
    title: string;
    url: string;
    description: string;
    section: string;
}

export type FormattedSearchResultData = FormattedSearchResultItem[];
