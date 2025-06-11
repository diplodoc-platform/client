import type {DocInnerProps} from './components/App';

import React from 'react';
import {createRoot} from 'react-dom/client';

import {Search} from './components/Search';
import {setRootClasses} from './interceptors/fast-class-applier';

const root = document.getElementById('root');
const data = window.__DATA__;

if (!root) {
    throw new Error('Root element not found!');
}

const props = data as DocInnerProps;
setRootClasses(props);
createRoot(root).render(<Search {...props} />);
