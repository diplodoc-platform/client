import type {SearchConfig} from './components/Search';

import React from 'react';
import {createRoot} from 'react-dom/client';

import {Search} from './components/Search';

const root = document.getElementById('root');

if (!root) {
    throw new Error('Root element not found!');
}

const data = window.__DATA__ as SearchConfig;
const searchConfig = data || {};
searchConfig.depth = searchConfig.depth || 3;

const url = new URL(window.location.href);

const props = {
    data,
    url,
};

createRoot(root).render(<Search {...props} />);
