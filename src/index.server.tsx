import React from 'react';
import {renderToString} from 'react-dom/server';

import {App, DocInnerProps} from './components/App/App';

export const render = (props: DocInnerProps) => renderToString(<App { ...props } />);


