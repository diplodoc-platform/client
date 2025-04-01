import {Lang} from '@diplodoc/components';

import {request} from '../../api';
import {OnlineSearchResult} from '../../models/search';

interface OnlineSearchQueryData {
    query: string;
    project: string;
    page?: number;
    isProxied?: boolean;
    docApiPathSeed?: string;
    useSeedAsRoot?: boolean;
    base?: string;
}

export function searchAll(lang: Lang, queryData: OnlineSearchQueryData, root: string) {
    return request<OnlineSearchResult>({
        method: 'GET',
        url: root + 'docs-api/search/all',
        params: {lang, ...queryData},
    });
}

export function searchSuggest(lang: Lang, queryData: OnlineSearchQueryData, root: string) {
    return request<OnlineSearchResult>({
        method: 'GET',
        url: root + 'docs-api/search/suggest',
        params: {lang, ...queryData},
    });
}
