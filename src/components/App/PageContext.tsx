import type {DocBasePageData} from '@diplodoc/components';
import type {PageData} from './index';
import type {Props as HeaderControlsProps} from '../HeaderControls';
import type {Settings} from '../../utils';

import {createContext, useContext} from 'react';

export type CustomPageProps = Settings & Partial<HeaderControlsProps>;

export interface PageContextProps {
    data: DocBasePageData & PageData;
    props: CustomPageProps;
    hasLayout: boolean;
}

const PageContext = createContext<PageContextProps | null>(null);

export const PageProvider = PageContext.Provider;

export function usePageContext() {
    const context = useContext(PageContext);

    if (!context) {
        throw new Error('usePageContext must be used within PageProvider');
    }

    return context;
}
