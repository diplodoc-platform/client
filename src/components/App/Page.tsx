import type {AppProps, DocContentPageData, PageData} from './index';
import type {Settings} from '../../utils';
import type {DocBasePageData} from '@diplodoc/components';
import type {Props as HeaderControlsProps} from '../HeaderControls';
import type {PageContextProps} from './PageContext';

import React, {useCallback, useMemo} from 'react';
import {PageConstructor, PageConstructorProvider} from '@gravity-ui/page-constructor';

import {useContent} from '../ConstructorPage/useContent';
import {Suggest} from '../Search/Suggest';
import {HeaderControls} from '../HeaderControls';
import {useNavigation} from '../ConstructorPage/useNavigation';

import {PageProvider} from './PageContext';
import {CustomPage} from './CustomPage';

type PageProps<T extends {} = {}> = {
    data: DocBasePageData<T> & PageData;
    props: {
        router: AppProps['router'];
    } & Settings;
    controls: HeaderControlsProps;
};

export function Page({data, props, controls}: PageProps) {
    const {theme, fullScreen} = props;

    const CustomControls = useCallback(() => <HeaderControls {...controls} />, [controls]);

    const navigation = useNavigation(data, controls, CustomControls, Suggest);
    const content = useContent(data as DocContentPageData, CustomPage);
    const headerControls = useMemo(() => {
        if (navigation.withControls) {
            return filterControls(controls, [
                'theme',
                'onChangeTheme',
                'textSize',
                'onChangeTextSize',
                'wideFormat',
                'onChangeWideFormat',
                'showMiniToc',
                'onChangeShowMiniToc',
                'langs',
                'onChangeLang',
            ]);
        }

        return controls;
    }, [navigation.withControls, controls]);
    const custom = useMemo(() => {
        return {
            navigation: navigation.custom,
            blocks: content.custom,
        };
    }, [navigation, content]);
    const hasLayout = Boolean(navigation.layout);
    const pageContext = useMemo<PageContextProps>(() => {
        const pageProps = {...props, ...headerControls};

        return {data, props: pageProps, hasLayout};
    }, [data, hasLayout, headerControls, props]);

    return (
        <PageProvider value={pageContext}>
            <PageConstructorProvider
                theme={theme}
                projectSettings={{disableCompress: true}}
                ssrConfig={{
                    isServer: Boolean(process.env.BROWSER),
                }}
            >
                <PageConstructor
                    custom={custom}
                    content={content.layout}
                    navigation={fullScreen ? undefined : navigation.layout}
                />
            </PageConstructorProvider>
        </PageProvider>
    );
}

function filterControls(controls: HeaderControlsProps, omitProps: string[]) {
    return Object.keys(controls).reduce(
        (acc, key) => {
            if (!omitProps.includes(key)) {
                acc[key] = controls[key as keyof HeaderControlsProps];
            }

            return acc;
        },
        {} as Record<string, unknown>,
    ) as Partial<HeaderControlsProps>;
}
