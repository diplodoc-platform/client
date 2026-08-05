export interface SearchParams {
    query: string;
    page: number;
    tags: string[];
}

function decodeTag(tag: string): string {
    try {
        return decodeURIComponent(tag.replaceAll('+', ' '));
    } catch {
        return tag.replaceAll('+', ' ');
    }
}

export function buildSearchParams(query: string, page = 1, tags: string[] = []): string {
    const params: string[] = [];

    if (query) {
        params.push(`query=${encodeURIComponent(query)}`);
    }

    if (tags.length) {
        params.push(`tags=${tags.map(encodeURIComponent).join(',')}`);
    }

    if (page > 1) {
        params.push(`page=${page}`);
    }

    return params.join('&');
}

export function parseSearchParams(search: string): SearchParams {
    const params = new URLSearchParams(search);
    const rawTags = search
        .replace(/^\?/, '')
        .split('&')
        .find((part) => part.startsWith('tags='))
        ?.slice('tags='.length);
    const tags = (rawTags || '').split(',').filter(Boolean).map(decodeTag);

    return {
        query: params.get('query') || '',
        page: Number(params.get('page')) || 1,
        tags: [...new Set(tags)],
    };
}
