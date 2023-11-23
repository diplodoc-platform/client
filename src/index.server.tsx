import React from 'react';
import {renderToString} from 'react-dom/server';

import {App, DocInnerProps, DocLeadingPageData, DocPageData} from './components/App/App';

export type {DocInnerProps, DocPageData, DocLeadingPageData};

export const render = (props: DocInnerProps) => renderToString(<App {...props} />);
