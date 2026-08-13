import type {FormattedSearchResultData, SearchProviderExtended, SearchResultData} from './types';

import {type FC, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {SearchPage, TagsFilter} from '@diplodoc/components';
import block from 'bem-cn-lite';

import {useSearch} from '../index';
import {useRouter} from '../Router';

import {useProvider} from './useProvider';
import {buildSearchParams, parseSearchParams} from './searchParams';
import './Page.scss';

const b = block('Search');

function setUrlParams(query: string, page: number, tags: string[]) {
    const params = buildSearchParams(query, page, tags);
    const url = params ? `?${params}` : window.location.pathname;

    window.history.pushState({}, '', url);
}

function formatResults(searchResults: SearchResultData[]): FormattedSearchResultData {
    if (!Array.isArray(searchResults)) {
        return [];
    }

    return searchResults.map((result) => ({
        title: result?.title || result?.hierarchy?.lvl0 || result?.hierarchy?.lvl1 || '',
        url: result?.url || result?.link || '#',
        description: result?.description || result?.content || result?.text || '',
        section: result?.section || result?.hierarchy?.lvl1 || '',
    }));
}

const ITEMS_PER_PAGE = 10;

export const Page: FC = () => {
    const provider = useProvider();
    const router = useRouter();
    const search = useSearch();

    const [query, setQuery] = useState<string>('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [page, setPage] = useState<number>(1);
    const [results, setResults] = useState<FormattedSearchResultData>([]);
    const [total, setTotal] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);

    const providerRef = useRef<SearchProviderExtended | null>(null);

    useEffect(() => {
        providerRef.current = provider as SearchProviderExtended;
        provider?.init?.();
    }, [provider]);

    useEffect(() => {
        const {query: q, page: p, tags} = parseSearchParams(window.location.search);

        setQuery(q);
        setPage(p);
        setSelectedTags(tags);
    }, [router]);

    useEffect(() => {
        let cancelled = false;
        const hasRequest = Boolean(query.trim() || selectedTags.length);

        if (hasRequest && providerRef.current) {
            setLoading(true);

            providerRef.current
                .search(query, page, ITEMS_PER_PAGE, selectedTags)
                .then((searchResults) => {
                    if (cancelled) {
                        return;
                    }

                    const {items, total} = searchResults;
                    const formatted = formatResults(items ?? []);

                    setResults(formatted);
                    setTotal(total);
                })
                .catch(() => {
                    if (cancelled) {
                        return;
                    }

                    setResults([]);
                    setTotal(0);
                })
                .finally(() => {
                    if (!cancelled) {
                        setLoading(false);
                    }
                });
        } else {
            setResults([]);
            setTotal(0);
            setLoading(false);
        }

        return () => {
            cancelled = true;
        };
    }, [query, page, provider, selectedTags]);

    const handlePageChange = useCallback(
        (newPage: number) => {
            setUrlParams(query, newPage, selectedTags);
            setPage(newPage);
        },
        [query, selectedTags],
    );

    const handleQueryChange = useCallback(
        (newQuery: string) => {
            setUrlParams(newQuery, 1, selectedTags);
            setQuery(newQuery);
            setPage(1);
        },
        [selectedTags],
    );

    const handleTagsChange = useCallback(
        (tags: string[]) => {
            setUrlParams(query, 1, tags);
            setSelectedTags(tags);
            setPage(1);
        },
        [query],
    );

    const availableTags = useMemo(
        () => [...new Set((search?.tags || []).filter((tag) => !tag.startsWith('_')))],
        [search?.tags],
    );
    const hasRequest = Boolean(query.trim() || selectedTags.length);

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
                hasRequest={hasRequest}
                filters={
                    availableTags.length ? (
                        <TagsFilter
                            tags={availableTags}
                            selectedTags={selectedTags}
                            onChange={handleTagsChange}
                        />
                    ) : null
                }
            />
        </div>
    );
};
