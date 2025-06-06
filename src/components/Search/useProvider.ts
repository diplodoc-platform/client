import {useContext, useEffect, useMemo, useState} from 'react';
import {ISearchProvider} from '@diplodoc/components';

import {RouterContext, SearchContext} from '../index';
import {useLang} from '../../hooks/useLang';

import {createProvider} from './provider';

export function useProvider() {
    const lang = useLang();
    const {depth = 0} = useContext(RouterContext);
    const search = useContext(SearchContext);
    const [provider, setProvider] = useState<ISearchProvider | null>(null);

    const config = useMemo(() => {
        if (!search) {
            return null;
        }

        return {
            ...search,
            depth,
            lang,
        };
    }, [lang, depth, search]);

    useEffect(() => {
        if (config) {
            setProvider(createProvider(config));
        }
    }, [config]);

    return provider;
}
