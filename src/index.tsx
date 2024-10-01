import React from 'react';
import {createRoot, hydrateRoot} from 'react-dom/client';

import {App, DocAnalytics, DocInnerProps, DocLeadingPageData, DocPageData} from './components/App';
import {setRootClasses} from './interceptors/fast-class-applier';

export type {DocInnerProps, DocPageData, DocLeadingPageData, DocAnalytics};
export type {
    SearchConfig as ISearchProviderConfig,
    WorkerConfig as ISearchWorkerConfig,
    WorkerApi as ISearchWorkerApi,
} from './components/Search';

declare global {
    interface Window {
        STATIC_CONTENT: boolean;
        __DATA__: DocInnerProps;
    }
}

const root = document.getElementById('root');
const props = window.__DATA__;

if (!root) {
    throw new Error('Root element not found!');
}

setRootClasses(props);

if (window.STATIC_CONTENT) {
    hydrateRoot(root, <App {...props} />);
} else {
    createRoot(root).render(<App {...props} />);
}
