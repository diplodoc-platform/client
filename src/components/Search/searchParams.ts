export interface SearchParams {
    query: string;
    page: number;
    tags: string[];
}

const MAX_TAG_LENGTH = 32;

function decodeTag(tag: string): string {
    try {
        return decodeURIComponent(tag.replaceAll('+', ' '));
    } catch {
        return tag.replaceAll('+', ' ');
    }
}

function normalizeTags(tags: string[] = []): string[] {
    const seen = new Set<string>();

    for (const tag of tags) {
        const value = Array.from(tag.trim().toLowerCase()).slice(0, MAX_TAG_LENGTH).join('');

        if (value && !value.startsWith('_')) {
            seen.add(value);
        }
    }

    return [...seen];
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
    const tags = normalizeTags((rawTags || '').split(',').filter(Boolean).map(decodeTag));

    return {
        query: params.get('query') || '',
        page: Number(params.get('page')) || 1,
        tags,
    };
}
