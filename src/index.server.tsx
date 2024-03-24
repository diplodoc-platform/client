import React from 'react';
import {renderToString} from 'react-dom/server';

import {App, DocInnerProps, DocLeadingPageData, DocPageData} from './components/App/App';
import {LINK_KEYS} from './constants';

export type {DocInnerProps, DocPageData, DocLeadingPageData};
export {LINK_KEYS};

export const render = (props: DocInnerProps) => renderToString(<App {...props} />);
