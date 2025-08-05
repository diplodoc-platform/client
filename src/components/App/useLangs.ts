import type {AppProps} from './index';
import type {Lang} from '@diplodoc/components';

import {getLangPath} from '@diplodoc/components';
import {useCallback, useMemo} from 'react';

export function useLangs({router, lang, langs}: AppProps, skipHtmlExtension?: boolean) {
    const onChangeLang = useCallback(
        (newLang: `${Lang}` | Lang) => {
            window.location.replace(
                getLangPath(router, newLang, window.location.href, skipHtmlExtension),
            );
        },
        [router, skipHtmlExtension],
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
