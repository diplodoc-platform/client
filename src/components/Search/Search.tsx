import type {FormattedSearchResultData, SearchProviderExtended, SearchResultData} from './types';

import React, {useCallback, useEffect, useRef, useState} from 'react';
import {SearchPage} from '@diplodoc/components';
import block from 'bem-cn-lite';

import {useRouter} from '../Router';

import {useProvider} from './useProvider';
import './Search.scss';

const b = block('Search');
const ITEMS_PER_PAGE = 10;

function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        query: params.get('query') || '',
        page: Number(params.get('page')) || 1,
    };
}

function setUrlParams(query: string, page: number) {
    const params = new URLSearchParams();
    if (query) params.set('query', query);
    if (page > 1) params.set('page', String(page));
    window.history.pushState({}, '', `?${params.toString()}`);
}

function formatResults(searchResults: SearchResultData[]): FormattedSearchResultData {
    if (!Array.isArray(searchResults)) return [];
    return searchResults.map((result) => ({
        title: result?.title || result?.hierarchy?.lvl0 || result?.hierarchy?.lvl1 || '',
        url: result?.url || result?.link || '#',
        description: result?.description || result?.content || result?.text || '',
        section: result?.section || result?.hierarchy?.lvl1 || '',
    }));
}

export const Search: React.FC = () => {
    const provider = useProvider();
    const router = useRouter();

    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const [results, setResults] = useState<FormattedSearchResultData>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    const providerRef = useRef<SearchProviderExtended | null>(null);

    useEffect(() => {
        providerRef.current = provider as SearchProviderExtended;
        provider?.init?.();
    }, [provider]);

    useEffect(() => {
        const {query: q, page: p} = getUrlParams();
        setQuery(q);
        setPage(p);
    }, [router]);

    const performSearch = useCallback(async (searchQuery: string, currentPage: number) => {
        setLoading(true);
        try {
            const searchResults = await providerRef.current?.search(
                searchQuery,
                currentPage,
                ITEMS_PER_PAGE,
            );
            const formatted = formatResults(searchResults ?? []);

            const start = (currentPage - 1) * ITEMS_PER_PAGE;
            const end = currentPage * ITEMS_PER_PAGE;

            const pageResult = formatted.slice(start, end);

            setResults(pageResult);

            const totalItems = formatted.length;

            setTotal(formatted.length > 0 ? totalItems : 0);
        } catch {
            setResults([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (query && providerRef.current) {
            performSearch(query, page);
        } else {
            setResults([]);
            setTotal(0);
        }
    }, [query, page, provider, performSearch]);

    const handlePageChange = useCallback(
        (newPage: number) => {
            setUrlParams(query, newPage);
            setPage(newPage);
        },
        [query],
    );

    const handleQueryChange = useCallback((newQuery: string) => {
        setUrlParams(newQuery, 1);
        setQuery(newQuery);
        setPage(1);
    }, []);

    return (
        <div className={b()}>
            <SearchPage
                query={query}
                items={results}
                page={page}
                totalItems={total}
                onPageChange={handlePageChange}
                onSubmit={handleQueryChange}
                loading={loading}
            />
        </div>
    );
};
