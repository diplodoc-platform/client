import type {ReactElement} from 'react';
import type {SearchConfig, WorkerApi, WorkerConfig} from './types';

import React from 'react';
import {Lang, configure as configureDocs} from '@diplodoc/components';
import {ThemeProvider, configure as configureUikit} from '@gravity-ui/uikit';

import {LangProvider} from '../../hooks/useLang';
import {getDirection} from '../../utils';
import {useSettings} from '../App/useSettings';
import {RouterProvider} from '../Router';

import {Search} from './Search';
import {SearchProvider} from './useSearch';

export type {SearchConfig, WorkerConfig, WorkerApi};

export interface SearchProps {
    data: SearchConfig;
    url: URL;
}

export function SearchPage(props: SearchProps): ReactElement {
    const {data, url} = props;

    const searchData = data.search;
    const lang = (searchData?.lang as Lang) || Lang.En;
    const settings = useSettings();
    const direction = getDirection(lang);
    const {theme} = settings;

    configureUikit({lang});
    configureDocs({lang});

    const routerConfig = {
        pathname: url.pathname,
        depth: 3,
    };

    return (
        <ThemeProvider theme={theme} direction={direction}>
            <LangProvider value={lang}>
                <RouterProvider value={routerConfig}>
                    <SearchProvider value={searchData}>
                        <Search />
                    </SearchProvider>
                </RouterProvider>
            </LangProvider>
        </ThemeProvider>
    );
}
