import type {AppProps} from './index';
import type {Lang} from '@diplodoc/components';

import {getLangPath} from '@diplodoc/components';
import {useCallback, useMemo} from 'react';

export function useLangs({lang, langs}: AppProps) {
    const onChangeLang = useCallback((newLang: `${Lang}` | Lang) => {
        window.location.replace(getLangPath(newLang, window.location.href));
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
