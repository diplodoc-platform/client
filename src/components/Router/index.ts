import type {Router} from '@diplodoc/components';

import {createContext, useContext} from 'react';

export interface RouterConfig extends Router {
    base: string;
}

export const RouterContext = createContext<RouterConfig>({
    pathname: '/',
    base: './',
});

RouterContext.displayName = 'RouterContext';

export const RouterProvider = RouterContext.Provider;

export function useRouter() {
    return useContext(RouterContext);
}
