import React from 'react';
import {createRoot, hydrateRoot} from 'react-dom/client';

import {
    App,
    DocAnalytics,
    DocInnerProps,
    DocLeadingPageData,
    DocPageData,
} from './components/App/App';

export type {DocInnerProps, DocPageData, DocLeadingPageData, DocAnalytics};

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

if (window.STATIC_CONTENT) {
    hydrateRoot(root, <App {...props} />);
} else {
    createRoot(root).render(<App {...props} />);
}
