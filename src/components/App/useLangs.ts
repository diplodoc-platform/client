import type {AppProps} from './index';
import type {Lang, LangOptions} from '@diplodoc/components';

import {useCallback, useMemo} from 'react';

import {getDomainPath, getLangPath} from '../../utils';

export function useLangs({lang, langs}: AppProps) {
    const onChangeLang = useCallback((newLang: `${Lang}` | Lang, options?: LangOptions) => {
        const {tld, href} = options || {};

        if (href) {
            window.location.href = href;

            return;
        }

        const url = window.location.href;

        if (tld) {
            window.location.replace(getDomainPath(newLang, tld, url));
        } else {
            window.location.replace(getLangPath(newLang, url));
        }
    }, []);

    return useMemo(
        () => ({
            lang,
            langs,
            onChangeLang,
        }),
        [lang, langs, onChangeLang],
    );
}
