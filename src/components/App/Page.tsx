import type {PropsWithChildren} from 'react';
import type {AppProps, PageData} from './index';
import type {Settings} from '../../utils';

import React, {useCallback, useMemo} from 'react';
import {PageConstructor, PageConstructorProvider} from '@gravity-ui/page-constructor';
import {DocBasePageData, getPageByType, getPageType} from '@diplodoc/components';

import {Layout} from '../Layout';
import {ConstructorPage} from '../ConstructorPage';
import {useContent} from '../ConstructorPage/useContent';
import {Suggest} from '../Search/Suggest';
import {HeaderControls, Props as HeaderControlsProps} from '../HeaderControls';
import {useNavigation} from '../ConstructorPage/useNavigation';

import {DocContentPageData, WithNavigation} from './index';

type Props = PropsWithChildren<Partial<AppProps> & {data: PageData; headerHeight: number}>;

export function Page({data, ...pageProps}: Props) {
    const type = getPageType(data);
    const Page = getPageByType(type);

    return (
        <Layout headerHeight={pageProps.headerHeight}>
            <Layout.Content>
                {/*@ts-ignore*/}
                <Page {...data} {...pageProps} />
            </Layout.Content>
        </Layout>
    );
}

type PageProps<T extends {} = {}> = {
    data: DocBasePageData<T> & PageData;
    props: {
        router: AppProps['router'];
    } & Settings;
    controls: HeaderControlsProps;
};

export function LegacyNavPage({data, props, controls}: PageProps) {
    const {theme} = props;

    const CustomPage = useCallback(
        () => <ConstructorPage {...(data as DocContentPageData).data} />,
        [data],
    );
    const content = useContent(data as DocContentPageData, CustomPage);

    const custom = useMemo(
        () => ({
            blocks: content.custom,
        }),
        [content],
    );

    return (
        <Page data={data} headerHeight={0} {...props} {...controls}>
            <PageConstructorProvider theme={theme}>
                <PageConstructor custom={custom} content={content.layout} />
            </PageConstructorProvider>
        </Page>
    );
}

export function RichNavPage({data, props, controls}: PageProps<WithNavigation>) {
    const {theme, fullScreen} = props;

    const CustomSuggest = useCallback(() => <Suggest />, []);
    const CustomControls = useCallback(() => <HeaderControls {...controls} />, [controls]);
    const navigation = useNavigation(data, controls, CustomControls, CustomSuggest);

    const CustomPage = useCallback(
        () => (
            <Page
                data={data}
                headerHeight={fullScreen ? 0 : 64}
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
        ),
        [data, navigation, props, controls, fullScreen],
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
        <PageConstructorProvider theme={theme}>
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
