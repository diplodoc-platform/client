import type {ComponentType, ReactNode} from 'react';
import type {DocBasePageData, ViewerInterface} from '@diplodoc/components';
import type {WithNavigation} from '../App';
import type {Props as HeaderControlsProps} from '../HeaderControls';
import type {NavigationData, NavigationItemModel} from './navigationTypes';

import {useMemo} from 'react';
import {
    ControlSizes,
    CustomNavigation,
    MobileDropdown,
    NavigationDropdown,
    NavigationLabel,
} from '@diplodoc/components';

import {HEADER_HEIGHT} from '../../constants';
import {useRouter, useSearch} from '../';

function findItem(right: NavigationItemModel[], left: NavigationItemModel[], type: string) {
    return right.some((item) => item.type === type) || left.some((item) => item.type === type);
}

type NavigationDataWithOptionalLogo = Omit<NavigationData, 'logo'> & {
    logo?: NavigationData['logo'];
};

const EmptyNavigation = {} as NavigationData;
const EmptyHeader = {} as NavigationData['header'];
const EmptyLeftItems = [] as NavigationItemModel[];
const EmptyRightItems = [] as NavigationItemModel[];

export const useNavigation = (
    data: DocBasePageData<WithNavigation>,
    controls: HeaderControlsProps,
    CustomControls: ComponentType<{}>,
    CustomSuggest: () => ReactNode,
    viewerInterface?: ViewerInterface,
): {
    custom: {
        search: typeof CustomSuggest;
        controls: typeof CustomControls;
        MobileDropdown: typeof MobileDropdown;
        label: typeof NavigationLabel;
        dropdown: typeof NavigationDropdown;
    };
    layout?: {
        // PageConstructor gets an empty header; CustomNavigation renders the real items.
        header: {leftItems: never[]};
        renderNavigation: () => ReactNode;
        logo: NavigationData['logo'];
    };
    withControls: boolean;
} => {
    const {toc} = data;
    const navigation = toc.navigation || EmptyNavigation;
    const {header = EmptyHeader, logo} = navigation as NavigationDataWithOptionalLogo;
    const {leftItems = EmptyLeftItems, rightItems = EmptyRightItems} =
        header as NavigationData['header'];

    const withControls = findItem(rightItems, leftItems, 'controls');
    const withSearch = findItem(rightItems, leftItems, 'search');

    const search = useSearch();
    const router = useRouter();

    if (search && !withSearch) {
        rightItems.unshift({type: 'search'} as unknown as NavigationItemModel);
    }

    const navigationData = useMemo(
        () => ({
            withBorder: true,
            leftItems: leftItems,
            rightItems: rightItems,
            customMobileHeaderItems: [{type: 'search'} as unknown as NavigationItemModel],
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
            viewerInterface,
        }),
        [controls, viewerInterface],
    );

    const layout = useMemo(
        () =>
            EmptyNavigation === navigation
                ? undefined
                : {
                      header: {
                          leftItems: [],
                      },
                      renderNavigation: () => (
                          <CustomNavigation
                              logo={{...logo, icon: logo?.icon ?? ''}}
                              data={navigationData}
                              navigationTocData={navigationTocData}
                              mobileControlsData={mobileControlsData}
                          />
                      ),
                      logo: {...logo, icon: logo?.icon ?? ''},
                  },
        [navigationData, navigationTocData, mobileControlsData, logo, navigation],
    );

    const config = useMemo(
        () => ({
            custom: {
                search: CustomSuggest,
                controls: CustomControls,
                MobileDropdown: MobileDropdown,
                label: NavigationLabel,
                dropdown: NavigationDropdown,
            },
            layout,
            withControls,
        }),
        [CustomSuggest, CustomControls, layout, withControls],
    );

    return config;
};
