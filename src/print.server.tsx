import React from 'react';
import {renderToString} from 'react-dom/server';

import {DocInnerProps, Print} from './components/Print/Print';

export const render = (props: DocInnerProps) => renderToString(<Print {...props} />);
