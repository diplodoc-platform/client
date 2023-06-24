import React from 'react';
import { hydrateRoot, createRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';

import { App, DocInnerProps, DocPageData, DocLeadingPageData } from './components/App/App';

export type { DocInnerProps, DocPageData, DocLeadingPageData };

declare global {
    interface Window { STATIC_CONTENT: boolean; }
}

let render: (props: DocInnerProps) => string;

if (process.env.BROWSER) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const root = document.getElementById('root');
    const props = (window as any).__DATA__ || {};

    if (!root) {
        throw new Error('Root element not found!');
    }

    if (window.STATIC_CONTENT) {
        hydrateRoot(root, <App { ...props } />);
    } else {
        createRoot(root).render(<App { ...props } />);
    }
} else {
    render = (props: DocInnerProps) => renderToString(<App { ...props } />);
}

export { render };


