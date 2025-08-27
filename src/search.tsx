import type {SearchConfig} from './components/Search';

import React from 'react';
import {createRoot} from 'react-dom/client';
import {Lang, configure as configureDocs} from '@diplodoc/components';
import {configure as configureUikit} from '@gravity-ui/uikit';

import {Search, SearchProvider} from './components/Search';
import {RouterProvider} from './components/Router';
import {LangProvider} from './hooks/useLang';

const root = document.getElementById('root');

if (!root) {
    throw new Error('Root element not found!');
}

const url = new URL(window.location.href);

const windowData = window.__DATA__ as SearchConfig;
const searchConfig = windowData || {};
const searchData = windowData.search;

const lang = (searchData?.lang as Lang) || Lang.En;

configureUikit({lang});
configureDocs({lang});

searchConfig.depth = searchConfig.depth || 3;

const routerConfig = {
    pathname: url.pathname,
    depth: 3,
};

createRoot(root).render(
    <LangProvider value={lang}>
        <RouterProvider value={routerConfig}>
            <SearchProvider value={searchData}>
                <Search />
            </SearchProvider>
        </RouterProvider>
    </LangProvider>,
);
