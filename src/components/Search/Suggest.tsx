import type {ISearchProvider, SearchSuggestApi} from '@diplodoc/components';

import React, {useCallback, useMemo, useRef, useState} from 'react';
import {AiIcon, NeuroExpertModal, SearchSuggest, useInterface} from '@diplodoc/components';
import {Icon} from '@gravity-ui/uikit';
import {Magnifier} from '@gravity-ui/icons';
import block from 'bem-cn-lite';

import {updateRootClassName} from '../../utils';
import {useNeuroExpert} from '../NeuroExpert';

import {useProvider} from './useProvider';
import './Suggest.scss';

const b = block('Suggest');

function SearchButton() {
    return <Icon data={Magnifier} className={b('end')} size={24} />;
}

export function Suggest() {
    const provider: ISearchProvider | null = useProvider();
    const suggest = useRef<SearchSuggestApi>(null);
    const isSearchHidden = useInterface('search');

    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [modalQuery, setModalQuery] = useState<string>('');

    const neuroExpertProjectId = useNeuroExpert()?.projectId;

    const onAiAction = useMemo(
        () =>
            neuroExpertProjectId
                ? (query: string) => {
                      setModalQuery(query);
                      setModalOpen(true);
                  }
                : undefined,
        [neuroExpertProjectId],
    );

    const onModalClose = useCallback(() => {
        setModalOpen(false);
    }, []);

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

    if (!provider || isSearchHidden) {
        return null;
    }

    return (
        <>
            <SearchSuggest
                ref={suggest}
                provider={provider}
                onFocus={onFocus}
                onBlur={onBlur}
                endContent={<SearchButton />}
                className={b('input')}
                classNameContainer={`${b()} ${onAiAction ? b('with-ai') : ''}`}
                classNameClose={b('close')}
                closeButton={true}
                startContent={onAiAction ? <AiIcon /> : undefined}
                focusFirstSearchResult={Boolean(onAiAction)}
                onAiAction={onAiAction}
            />
            {neuroExpertProjectId && (
                <NeuroExpertModal
                    open={modalOpen}
                    query={modalQuery}
                    projectId={neuroExpertProjectId}
                    onClose={onModalClose}
                />
            )}
        </>
    );
}
