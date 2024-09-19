import type {ReactNode} from 'react';
import type {NavigationData} from '@gravity-ui/page-constructor';
import type {DocBasePageData} from '@diplodoc/components';
import type {WithNavigation} from '../App';
import type {Props as HeaderControlsProps} from '../HeaderControls';

import React, {useMemo} from 'react';
import {ControlSizes, CustomNavigation, MobileDropdown} from '@diplodoc/components';

import {HEADER_HEIGHT} from '../../constants';
import {useRouter} from '../';

export const useNavigation = (
    data: DocBasePageData<WithNavigation>,
    controls: HeaderControlsProps,
    CustomControls: () => ReactNode,
    CustomSuggest: () => ReactNode,
) => {
    const {toc} = data;
    const {navigation} = toc;
    const {header = {}, logo} = navigation;
    const {leftItems = [], rightItems = []} = header as NavigationData['header'];

    const withControls = rightItems.some((item: {type: string}) => item.type === 'controls');

    const router = useRouter();

    const navigationData = useMemo(
        () => ({
            withBorder: true,
            leftItems: leftItems,
            rightItems: rightItems,
        }),
        [leftItems, rightItems],
    );
    const navigationTocData = useMemo(
        () => ({
            toc,
            router,
            headerHeight: HEADER_HEIGHT,
        }),
        [toc, router],
    );
    const mobileControlsData = useMemo(
        () => ({
            controlSize: ControlSizes.L,
            userSettings: controls,
        }),
        [controls],
    );

    const layout = useMemo(
        () => ({
            header: {
                leftItems: [],
            },
            renderNavigation: () => (
                <CustomNavigation
                    logo={logo}
                    data={navigationData}
                    navigationTocData={navigationTocData}
                    mobileControlsData={mobileControlsData}
                />
            ),
            logo,
        }),
        [navigationData, navigationTocData, mobileControlsData, logo],
    );

    const config = useMemo(
        () => ({
            custom: {
                search: CustomSuggest,
                controls: CustomControls,
                MobileDropdown: MobileDropdown,
            },
            layout,
            withControls,
        }),
        [CustomSuggest, CustomControls, layout, withControls],
    );

    return config;
};
