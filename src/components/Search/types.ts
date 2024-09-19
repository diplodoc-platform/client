import {SearchSuggestPageItem} from '@diplodoc/components';

export interface SearchConfig {
    api: string;
    link: string;
    lang: string;
    depth: number;
}

export interface WorkerConfig {
    api: string;
    base: string;
    mark: string;
}

export interface WorkerApi {
    init?(): void | Promise<void>;
    suggest(query: string, count: number): Promise<SearchSuggestPageItem[]>;
    search(query: string, count: number, page: number): Promise<SearchSuggestPageItem[]>;
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

export type Message = InitMessage | SuggestMessage | SearchMessage;

export type MessageType = Message['type'];
