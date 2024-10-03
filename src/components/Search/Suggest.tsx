import type {ISearchProvider, SearchSuggestApi} from '@diplodoc/components';

import React, {useCallback, useRef} from 'react';
import {SearchSuggest} from '@diplodoc/components';
import {Icon} from '@gravity-ui/uikit';
import {Magnifier} from '@gravity-ui/icons';
import block from 'bem-cn-lite';

import {updateRootClassName} from '../../utils';

import {useProvider} from './useProvider';
import './Suggest.scss';

const b = block('Suggest');

function SearchButton() {
    return <Icon data={Magnifier} className={b('end')} size={24} />;
}

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
            endContent={<SearchButton />}
            className={b('input')}
            classNameContainer={b()}
            closeButton={true}
        />
    );
}
