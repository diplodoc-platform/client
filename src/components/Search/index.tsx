import type {ReactElement} from 'react';
import type {SearchConfig, WorkerApi, WorkerConfig} from './types';
import type {DocInnerProps} from '../App';

import React, {createContext, useContext, useEffect} from 'react';
import {ThemeProvider} from '@gravity-ui/uikit';
import {ConsentPopup, Lang, SUPPORTED_LANGS, configure} from '@diplodoc/components';

import {RouterProvider} from '../Router';
import {LangProvider} from '../../hooks/useLang';
import {getDirection, updateRootClassName, updateThemeClassName} from '../../utils';
import {useSettings} from '../App/useSettings';
import {useMobile} from '../App/useMobile';

import {Page} from './Page';

export type {SearchConfig, WorkerConfig, WorkerApi};

export const SearchContext = createContext<SearchConfig | null | undefined>(null);

SearchContext.displayName = 'SearchContext';

export const SearchProvider = SearchContext.Provider;

export function Search(props: DocInnerProps): ReactElement {
    const {lang, search, router, analytics} = props;
    const settings = useSettings();
    const mobileView = useMobile();
    const fixedLang = SUPPORTED_LANGS.includes(lang) ? lang : Lang.En;
    const direction = getDirection(lang);

    configure({
        lang: fixedLang,
        localeCode: fixedLang,
    });

    const {theme, wideFormat} = settings;

    useEffect(() => {
        updateRootClassName({mobileView, wideFormat});
        updateThemeClassName({theme});
    }, [theme, mobileView, wideFormat]);

    return (
        <ThemeProvider theme={theme} direction={direction}>
            <LangProvider value={fixedLang}>
                <RouterProvider value={router}>
                    <SearchProvider value={search}>
                        <Page />
                        {analytics && (
                            <ConsentPopup
                                router={router}
                                gtmId={analytics?.gtm?.id || ''}
                                consentMode={analytics?.gtm?.mode}
                            />
                        )}
                    </SearchProvider>
                </RouterProvider>
            </LangProvider>
        </ThemeProvider>
    );
}

export function useSearch() {
    return useContext(SearchContext);
}
