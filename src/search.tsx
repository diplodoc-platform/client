import type {SearchConfig} from './components/Search';

import React from 'react';
import {createRoot} from 'react-dom/client';
import {configure as configureUikit} from '@gravity-ui/uikit';
import {configure as configureDocs} from '@diplodoc/components';

import {Search, SearchProvider} from './components/Search';
import {RouterProvider} from './components/Router';

const root = document.getElementById('root');

if (!root) {
    throw new Error('Root element not found!');
}

const url = new URL(window.location.href);

const windowData = window.__DATA__ as SearchConfig;
const searchConfig = windowData || {};
const searchData = windowData.search;

const lang = searchData?.lang;

configureUikit({lang});
configureDocs({lang});

searchConfig.depth = searchConfig.depth || 3;

const routerConfig = {
    pathname: url.pathname,
    depth: 3,
};

createRoot(root).render(
    <RouterProvider value={routerConfig}>
        <SearchProvider value={searchData}>
            <Search />
        </SearchProvider>
    </RouterProvider>,
);
