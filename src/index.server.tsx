import React from 'react';
import {renderToString} from 'react-dom/server';

import {App, DocAnalytics, DocInnerProps, DocLeadingPageData, DocPageData} from './components/App';
import {LINK_KEYS, LINK_KEYS_LEADING_CONFIG, LINK_KEYS_PAGE_CONSTRUCTOR_CONFIG} from './constants';
import {ConfigData, PreloadParams, preprocess} from './preprocess';

export type {
    DocInnerProps,
    DocPageData,
    DocLeadingPageData,
    DocAnalytics,
    ConfigData,
    PreloadParams,
};
export type {
    SearchConfig as ISearchProviderConfig,
    WorkerConfig as ISearchWorkerConfig,
    WorkerApi as ISearchWorkerApi,
} from './components/Search';
export {LINK_KEYS, LINK_KEYS_LEADING_CONFIG, LINK_KEYS_PAGE_CONSTRUCTOR_CONFIG, preprocess};

export const render = (props: DocInnerProps) => renderToString(<App {...props} />);
