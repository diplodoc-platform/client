import type {Router} from '@diplodoc/components';

import {createContext, useContext} from 'react';

export interface RouterConfig extends Router {
    depth: number;
}

export const RouterContext = createContext<RouterConfig>({
    pathname: '/',
    depth: 0,
});

RouterContext.displayName = 'RouterContext';

export const RouterProvider = RouterContext.Provider;

export function useRouter() {
    return useContext(RouterContext);
}
