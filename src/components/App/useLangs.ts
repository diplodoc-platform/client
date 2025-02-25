import type {AppProps} from './index';

import {Lang, getLangPath} from '@diplodoc/components';
import {useCallback, useMemo} from 'react';

export function useLangs({router, lang, langs}: AppProps) {
    const onChangeLang = useCallback(
        (newLang: `${Lang}` | Lang) => {
            window.location.replace(getLangPath(router, newLang, window.location.href));
        },
        [router],
    );

    return useMemo(
        () => ({
            lang,
            langs,
            onChangeLang,
        }),
        [lang, langs, onChangeLang],
    );
}
