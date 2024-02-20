import React from 'react';
import {hydrateRoot} from 'react-dom/client';

import {Runtime} from './components/Print/Print';

const root = document.getElementById('root');

if (!root) {
    throw new Error('Root element not found!');
}

hydrateRoot(root, <Runtime/>);
