import React from 'react';
import {createRoot} from 'react-dom/client';
import {configure as configureUikit} from '@gravity-ui/uikit';
import {configure as configureDocs} from '@diplodoc/components';

import {Search, SearchConfig, SearchProvider} from './components/Search';
import {RouterProvider} from './components/Router';

const root = document.getElementById('root');

if (!root) {
    throw new Error('Root element not found!');
}

const url = new URL(window.location.href);

const windowData = window.__DATA__;
const searchConfig = (windowData || {}) as SearchConfig;
const lang = searchConfig.lang;

configureUikit({lang});
configureDocs({lang});

searchConfig.depth = searchConfig.depth || 3;

const routerConfig = {
    pathname: url.pathname,
    depth: 3,
};

createRoot(root).render(
    <RouterProvider value={routerConfig}>
        <SearchProvider value={searchConfig}>
            <Search />
        </SearchProvider>
    </RouterProvider>,
);
