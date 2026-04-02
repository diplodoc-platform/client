import type {FC} from 'react';
import type {Props as HeaderControlsProps} from '../HeaderControls';

import React, {createContext, useContext} from 'react';

import {HeaderControls} from '../HeaderControls';

const HeaderControlsContext = createContext<HeaderControlsProps | null>(null);

export const HeaderControlsProvider = HeaderControlsContext.Provider;

export const CustomControls: FC = () => {
    const props = useContext(HeaderControlsContext);

    if (!props) {
        throw new Error('CustomControls must be used within HeaderControlsProvider');
    }

    return <HeaderControls {...props} />;
};
