import type {PageData} from './index';
import type {ExtendedLang, Lang} from '@diplodoc/components';

import {isExternalHref} from '@diplodoc/components';
import {useMemo} from 'react';

export type Langs = (`${Lang}` | Lang | ExtendedLang)[];

export function hasLang(l: string, langs: Langs): boolean {
    return langs.some((cfg) => (typeof cfg === 'string' ? cfg === l : cfg.lang === l));
}

export function useAvailableLangs(data: PageData, langs: Langs) {
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

        if (hasLang(canonicalLang, langs)) {
            langsSet.add(canonicalLang as Lang);
        }

        for (const alt of alternate) {
            const href = alt.href;

            if (!href || isExternalHref(href)) {
                continue;
            }

            const [altLang] = href.split('/');

            if (hasLang(altLang, langs)) {
                langsSet.add(altLang as Lang);
            }
        }

        return Array.from(langsSet);
    }, [data, langs]);
}
