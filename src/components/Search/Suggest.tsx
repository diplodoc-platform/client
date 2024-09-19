import type {ISearchProvider, SearchSuggestApi} from '@diplodoc/components';

import React, {useCallback, useRef} from 'react';
import {SearchSuggest} from '@diplodoc/components';

import {updateRootClassName} from '../../utils';

import {useProvider} from './useProvider';
import './Suggest.scss';

export function Suggest() {
    const provider: ISearchProvider | null = useProvider();
    const suggest = useRef<SearchSuggestApi>(null);

    const onFocus = useCallback(() => {
        updateRootClassName({focusSearch: true});
    }, []);

    const onBlur = useCallback(() => {
        updateRootClassName({focusSearch: false});
        setTimeout(() => {
            if (suggest.current) {
                suggest.current.close();
            }
        }, 100);
    }, []);

    if (!provider) {
        return null;
    }

    return (
        <SearchSuggest
            ref={suggest}
            provider={provider}
            onFocus={onFocus}
            onBlur={onBlur}
            classNameContainer={'Suggest'}
        />
    );
}
