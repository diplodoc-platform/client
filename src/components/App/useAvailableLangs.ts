import type {PageData} from './index';

import {useMemo} from 'react';

export function useAvailableLangs(data: PageData) {
    return useMemo(() => {
        if (!('meta' in data)) {
            return [];
        }

        const canonical = data.meta.canonical;

        if (!canonical) {
            return [];
        }

        const alternate = data.meta.alternate || [];

        const [canonicalLang, ...canonicalRest] = canonical.split('/');
        const canonicalPath = canonicalRest.join('/');

        const langs = [canonicalLang];

        for (const alt of alternate) {
            const [altLang, ...altRest] = alt.split('/');
            const altPath = altRest.join('/');

            if (altPath === canonicalPath) {
                langs.push(altLang);
            }
        }

        return Array.from(new Set(langs));
    }, [data]);
}
