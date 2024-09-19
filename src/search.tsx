import React from 'react';
import {createRoot} from 'react-dom/client';

import {Search} from './components/Search';

const root = document.getElementById('root');

if (!root) {
    throw new Error('Root element not found!');
}

createRoot(root).render(<Search />);
