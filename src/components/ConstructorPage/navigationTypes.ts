import type {NavigationData as PageConstructorNavigationData} from '@gravity-ui/page-constructor';
import type {CustomNavigationProps} from '@diplodoc/components';

// Navigation inputs must follow the component's dependency tree, not a second PC install.
export type NavigationData = Omit<PageConstructorNavigationData, 'header' | 'logo'> & {
    header: CustomNavigationProps['data'];
    logo: CustomNavigationProps['logo'];
};

export type NavigationItemModel = CustomNavigationProps['data']['leftItems'][number];
