import type {AppProps} from './index';

import {Lang, getLangPath} from '@diplodoc/components';
import {useCallback, useMemo} from 'react';

export function useLangs({router, lang, langs}: AppProps) {
    const onChangeLang = useCallback(
        (lang: `${Lang}` | Lang) => {
            const path = getLangPath(router, lang);
            window.location.replace(path);
        },
        [router],
    );

    return useMemo(() => ({lang, langs, onChangeLang}), [lang, langs, onChangeLang]);
}
