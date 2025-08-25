import type {ISearchProvider} from '@diplodoc/components';

import {useEffect, useMemo, useState} from 'react';

import {useRouter, useSearch} from '../index';
import {useLang} from '../../hooks/useLang';

import {createProvider} from './provider';

export function useProvider() {
    const lang = useLang();
    const {base = './'} = useRouter();
    const search = useSearch();
    const [provider, setProvider] = useState<ISearchProvider | null>(null);

    const config = useMemo(() => {
        if (!search) {
            return null;
        }

        return {
            ...search,
            base,
            lang,
        };
    }, [lang, base, search]);

    useEffect(() => {
        if (config) {
            setProvider(createProvider(config));
        }
    }, [config]);

    return provider;
}
