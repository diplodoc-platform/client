import type {DocAnalytics, DocInnerProps, DocLeadingPageData, DocPageData} from './components/App';

import React from 'react';
import {createRoot, hydrateRoot} from 'react-dom/client';

import {App} from './components/App';
import {setRootClasses} from './interceptors/fast-class-applier';
import {createAnalyticsProps} from './utils';

export type {DocInnerProps, DocPageData, DocLeadingPageData, DocAnalytics};
export type {
    SearchConfig as ISearchProviderConfig,
    WorkerConfig as ISearchWorkerConfig,
    WorkerApi as ISearchWorkerApi,
} from './components/Search';

const root = document.getElementById('root');
const data = window.__DATA__;

if (!root) {
    throw new Error('Root element not found!');
}

function isDocInnerProps(obj: unknown): obj is DocInnerProps {
    return Boolean(obj) && typeof obj === 'object' && obj !== null && 'data' in obj;
}

if (!isDocInnerProps(data)) {
    throw new Error('Invalid data format for App component');
}

const props = data as DocInnerProps;
const {analyticsConfig, analyticsService} = createAnalyticsProps(props.analytics);

analyticsService.init();

setRootClasses(props);

const app = <App {...props} analytics={analyticsConfig} analyticsService={analyticsService} />;

if (window.STATIC_CONTENT) {
    hydrateRoot(root, app);
} else {
    createRoot(root).render(app);
}
