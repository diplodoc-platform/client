import type {PageData} from './index';

import {type Lang, isExternalHref} from '@diplodoc/components';
import {useMemo} from 'react';

export function useAvailableLangs(data: PageData, langs: (`${Lang}` | Lang)[]) {
    return useMemo(() => {
        if (!('meta' in data)) {
            return [];
        }

        const {canonical, alternate = []} = data.meta;

        if (!canonical) {
            return [];
        }

        const langsSet = new Set<Lang>();

        const [canonicalLang] = canonical.split('/');

        if (langs.includes(canonicalLang as Lang)) {
            langsSet.add(canonicalLang as Lang);
        }

        for (const alt of alternate) {
            const href = alt.href;

            if (!href || isExternalHref(href)) {
                continue;
            }

            const [altLang] = href.split('/');

            if (langs.includes(altLang as Lang)) {
                langsSet.add(altLang as Lang);
            }
        }

        return Array.from(langsSet);
    }, [data, langs]);
}
