import type {AppProps, DocContentPageData, PageData} from './index';
import type {Settings} from '../../utils';
import type {DocBasePageData} from '@diplodoc/components';
import {useAnalytics} from '@diplodoc/components';
import type {Props as HeaderControlsProps} from '../HeaderControls';
import type {PageContextProps} from './PageContext';
import type {AnalyticsContextProps} from '@gravity-ui/page-constructor';

import React, {useMemo} from 'react';
import {PageConstructor, PageConstructorProvider} from '@gravity-ui/page-constructor';

import {useContent} from '../ConstructorPage/useContent';
import {Suggest} from '../Search/Suggest';
import {useNavigation} from '../ConstructorPage/useNavigation';

import {PageProvider} from './PageContext';
import {CustomPage} from './CustomPage';
import {CustomControls} from './CustomControls';

type PageProps<T extends {} = {}> = {
    data: DocBasePageData<T> & PageData;
    props: {
        router: AppProps['router'];
    } & Settings;
    controls: HeaderControlsProps;
};

export function Page({data, props, controls}: PageProps) {
    const {theme, fullScreen} = props;

    const analytics = useAnalytics();
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

    const pageConstructorAnalytics: AnalyticsContextProps | undefined = React.useMemo(
        () =>
            analytics
                ? {
                      sendEvents: (events) => {
                          events.forEach((event) => {
                              analytics.track(event.name, undefined, {
                                  includeKeys: event.counters?.include,
                                  excludeKeys: event.counters?.exclude,
                              });
                          });
                      },
                  }
                : undefined,
        [analytics],
    );

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
                analytics={pageConstructorAnalytics}
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
