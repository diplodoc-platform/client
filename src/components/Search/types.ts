import type {ISearchResult, SearchSuggestPageItem} from '@diplodoc/components';

export interface SearchData {
    api: string;
    link: string;
    lang: string;
}

export interface SearchConfig extends SearchData {
    base: string;
}

export interface WorkerConfig {
    api?: string;
    base: string;
    mark: string;
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
    ): Promise<{items: ISearchResult[]; total: number}>;
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
    search(
        query: string,
        page?: number,
        count?: number,
    ): Promise<{items: ISearchResult[]; total: number}>;
    link(query: string, page?: number): string | null;
}

export type Message = InitMessage | SuggestMessage | SearchMessage;

export type MessageType = Message['type'];

export interface SearchResultData extends Partial<ISearchResult> {
    title?: string;
    url?: string;
    link?: string;
    description?: string;
    section?: string;
}

export interface FormattedSearchResultItem {
    title: string;
    url: string;
    description: string;
    section: string;
}

export type FormattedSearchResultData = FormattedSearchResultItem[];
