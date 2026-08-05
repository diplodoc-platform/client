import type {SearchConfig} from '../../types';

import {buildSearchParams} from '../../searchParams';

export function buildSearchLink(
    base: string,
    config: SearchConfig,
    query?: string,
    page = 1,
    tags: string[] = [],
) {
    const searchParams = buildSearchParams(query || '', page, tags);
    const params = searchParams ? `?${searchParams}` : '';
    const link = `${base}/${config.link}${params}`;

    return link;
}
