import type {ReactElement} from 'react';
import type {SearchConfig, SearchData, WorkerApi, WorkerConfig} from './types';

import React, {createContext, useContext, useEffect} from 'react';
import {ThemeProvider} from '@gravity-ui/uikit';
import {Lang, SUPPORTED_LANGS, configure} from '@diplodoc/components';

import {RouterProvider} from '../Router';
import {LangProvider} from '../../hooks/useLang';
import {getDirection, updateRootClassName, updateThemeClassName} from '../../utils';
import {useSettings} from '../App/useSettings';
import {useMobile} from '../App/useMobile';

import {Page} from './Page';

export type {SearchConfig, WorkerConfig, WorkerApi};

export const SearchContext = createContext<SearchConfig | SearchData | null | undefined>(null);

SearchContext.displayName = 'SearchContext';

export const SearchProvider = SearchContext.Provider;

export interface SearchProps {
    data: SearchConfig;
    url: URL;
}

export function Search(props: SearchProps): ReactElement {
    const {data, url} = props;

    const searchData = data.search;
    const lang = (searchData?.lang as Lang) || Lang.En;
    const settings = useSettings();
    const mobileView = useMobile();
    const fixedLang = SUPPORTED_LANGS.includes(lang) ? lang : Lang.En;
    const direction = getDirection(fixedLang);

    configure({
        lang: fixedLang,
        localeCode: fixedLang,
    });

    const routerConfig = {
        pathname: url.pathname,
        depth: 3,
    };

    const {theme, wideFormat} = settings;

    useEffect(() => {
        updateRootClassName({mobileView, wideFormat});
        updateThemeClassName({theme});
    }, [theme, mobileView, wideFormat]);

    return (
        <ThemeProvider theme={theme} direction={direction}>
            <LangProvider value={fixedLang}>
                <RouterProvider value={routerConfig}>
                    <SearchProvider value={searchData}>
                        <Page />
                    </SearchProvider>
                </RouterProvider>
            </LangProvider>
        </ThemeProvider>
    );
}

export function useSearch() {
    return useContext(SearchContext);
}
