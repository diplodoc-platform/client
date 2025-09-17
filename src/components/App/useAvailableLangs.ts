import type {PageData} from './index';
import type {Lang} from '@diplodoc/components';

import {useMemo} from 'react';

export function useAvailableLangs(data: PageData, langs: (`${Lang}` | Lang)[]) {
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

        const availableLangs = [canonicalLang];

        for (const alt of alternate) {
            const [altLang, ...altRest] = alt.split('/');
            const altPath = altRest.join('/');

            if (altPath === canonicalPath && langs.includes(altLang as Lang)) {
                availableLangs.push(altLang);
            }
        }

        return Array.from(new Set(availableLangs));
    }, [data, langs]);
}
