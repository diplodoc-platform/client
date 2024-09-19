import type {ReactNode} from 'react';
import type {NavigationData} from '@gravity-ui/page-constructor';
import type {DocBasePageData} from '@diplodoc/components';
import type {WithNavigation} from '../App';

import React, {useMemo} from 'react';
import {ControlSizes, CustomNavigation, MobileDropdown} from '@diplodoc/components';

import {HEADER_HEIGHT} from '../../constants';

export const useNavigation = (
    data: DocBasePageData<WithNavigation>,
    CustomControls: () => ReactNode,
) => {
    const {toc} = data;
    const {navigation} = toc;
    const {header = {}, logo} = navigation;
    const {leftItems = [], rightItems = []} = header as NavigationData['header'];

    const withControls = rightItems.some((item: {type: string}) => item.type === 'controls');

    const router = useRouter();
    const userSettings = useSettings();

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
            userSettings,
        }),
        [userSettings],
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
                controls: CustomControls,
                MobileDropdown: MobileDropdown,
            },
            layout,
            withControls,
        }),
        [CustomControls, layout, withControls],
    );

    return config;
};
