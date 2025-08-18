import type {SearchConfig} from '../../types';

export function buildSearchLink(base: string, config: SearchConfig, query?: string, page = 1) {
    const searchParams = new URLSearchParams();

    if (query) searchParams.set('query', query);
    if (page > 1) searchParams.set('page', page.toString());

    const params = searchParams.toString() ? `?${searchParams.toString()}` : '';
    const link = `${base}/${config.link}${params}`;

    return link;
}
