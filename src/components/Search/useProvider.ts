import {useContext, useMemo} from 'react';

import {RouterContext, SearchContext} from '../index';
import {useLang} from '../../hooks/useLang';

import {createProvider} from './provider';

export function useProvider() {
    const lang = useLang();
    const {depth = 0} = useContext(RouterContext);
    const search = useContext(SearchContext);

    return useMemo(() => {
        if (!search) {
            return null;
        }

        return createProvider({
            ...search,
            depth,
            lang,
        });
    }, [lang, depth, search]);
}
