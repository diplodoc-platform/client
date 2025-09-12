import type {AppProps, DocContentPageData, PageData} from './index';
import type {Settings} from '../../utils';
import type {DocBasePageData} from '@diplodoc/components';
import type {Props as HeaderControlsProps} from '../HeaderControls';

import React, {useCallback, useMemo} from 'react';
import {PageConstructor, PageConstructorProvider} from '@gravity-ui/page-constructor';
import {getPageByType, getPageType} from '@diplodoc/components';

import {Layout} from '../Layout';
import {ConstructorPage} from '../ConstructorPage';
import {useContent} from '../ConstructorPage/useContent';
import {Suggest} from '../Search/Suggest';
import {HeaderControls} from '../HeaderControls';
import {useNavigation} from '../ConstructorPage/useNavigation';

type PageProps<T extends {} = {}> = {
    data: DocBasePageData<T> & PageData;
    props: {
        router: AppProps['router'];
    } & Settings;
    controls: HeaderControlsProps;
};

export function Page({data, props, controls}: PageProps) {
    const {theme, fullScreen} = props;
    const type = getPageType(data);
    const Page = getPageByType(type);

    const CustomSuggest = useCallback(() => <Suggest />, []);
    const CustomControls = useCallback(() => <HeaderControls {...controls} />, [controls]);
    const navigation = useNavigation(data, controls, CustomControls, CustomSuggest);

    const CustomPage = useCallback(
        () => (
            <Layout headerHeight={fullScreen || !navigation.layout ? 0 : 64}>
                <Layout.Content>
                    {/*@ts-ignore*/}
                    <Page
                        {...data}
                        {...props}
                        {...(navigation.withControls
                            ? filterControls(controls, [
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
                              ])
                            : controls)}
                    >
                        <ConstructorPage {...(data as DocContentPageData).data} />
                    </Page>
                </Layout.Content>
            </Layout>
        ),
        [data, navigation, props, controls, fullScreen, Page],
    );
    const content = useContent(data as DocContentPageData, CustomPage);

    const custom = useMemo(
        () => ({
            navigation: navigation.custom,
            blocks: content.custom,
        }),
        [navigation, content],
    );

    return (
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
