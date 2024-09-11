import type {NavigationData, PageContent} from '@gravity-ui/page-constructor';
import type {ReactElement} from 'react';
import type {Props as HeaderControlsProps} from '../HeaderControls';
import type {Settings} from './useSettings';

import React, {useCallback, useEffect, useMemo} from 'react';
import {PageConstructor, PageConstructorProvider} from '@gravity-ui/page-constructor';
import {ThemeProvider} from '@gravity-ui/uikit';
import {
    ConsentPopup,
    DocBasePageData,
    DocContentPageData as DocContentPageDataBase,
    DocLeadingPageData,
    DocPageData,
    Lang,
    Router,
    configure,
} from '@diplodoc/components';
import '@diplodoc/transform/dist/js/yfm';

import {HeaderControls} from '../HeaderControls';
import {getDirection, updateRootClassName, updateThemeClassName} from '../../utils';
import {ConstructorPage} from '../ConstructorPage';
import {useContent} from '../ConstructorPage/useContent';
import {useNavigation} from '../ConstructorPage/useNavigation';
import {LangProvider} from '../../hooks/useLang';
import '../../interceptors/leading-page-links';
import '../../interceptors/fast-class-applier';

import {Page} from './Page';
import {Runtime} from './Runtime';
import {useLangs} from './useLangs';
import {useSettings} from './useSettings';
import {useMobile} from './useMobile';
import './App.scss';

export type DocAnalytics = {
    gtm?: {
        id?: string;
        mode?: 'base' | 'notification';
    };
};

export interface AppProps {
    lang: Lang;
    langs: Lang[];
    router: Router;
    analytics?: DocAnalytics;
}

export type WithNavigation = {
    navigation: NavigationData;
};

export type DocContentPageData = DocContentPageDataBase<PageContent>;

export type PageData = DocPageData | DocLeadingPageData | DocContentPageData;

export type DocInnerProps<Data extends PageData = PageData> = {
    data: Data;
} & AppProps;

export type {DocLeadingPageData, DocPageData};

type PageProps<T extends {} = {}> = {
    data: DocBasePageData<T> & PageData;
    props: {
        router: AppProps['router'];
    } & Settings;
    controls: HeaderControlsProps;
};

const LegacyNavPage = ({data, props, controls}: PageProps) => {
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
};

const empty = {};

const RichNavPage = ({data, props, controls}: PageProps<WithNavigation>) => {
    const {theme, fullScreen} = props;

    const CustomControls = useCallback(() => <HeaderControls {...controls} />, [controls]);
    const navigation = useNavigation(data, CustomControls);

    const CustomPage = useCallback(
        () => (
            <Page
                data={data}
                headerHeight={fullScreen ? 0 : 64}
                {...props}
                {...(navigation.withControls ? empty : controls)}
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
};

function hasNavigation(
    data: DocBasePageData<Partial<WithNavigation>>,
): data is DocBasePageData<WithNavigation> {
    return Boolean(data.toc.navigation);
}

export function App(props: DocInnerProps): ReactElement {
    const {data, router, lang, analytics} = props;

    configure({
        lang,
    });

    const settings = useSettings();
    const langs = useLangs(props);
    const mobileView = useMobile();

    const {theme, textSize, wideFormat, fullScreen, showMiniToc} = settings;

    const page = {
        router,

        theme,
        textSize,
        wideFormat,
        fullScreen,
        showMiniToc,
    };
    const controls: HeaderControlsProps = {
        ...settings,
        ...langs,
        mobileView,
    };
    const direction = getDirection(lang);

    useEffect(() => {
        updateRootClassName({mobileView, wideFormat, fullScreen});
        updateThemeClassName({theme});
    }, [theme, mobileView, wideFormat, fullScreen]);

    return (
        <div className="App">
            <LangProvider value={lang}>
                <ThemeProvider theme={theme} direction={direction}>
                    {hasNavigation(data) ? (
                        <RichNavPage data={data} props={page} controls={controls} />
                    ) : (
                        <LegacyNavPage data={data} props={page} controls={controls} />
                    )}
                    {analytics && (
                        <ConsentPopup
                            router={router}
                            gtmId={analytics?.gtm?.id || ''}
                            consentMode={analytics?.gtm?.mode}
                        />
                    )}
                </ThemeProvider>
            </LangProvider>
            <Runtime theme={theme} />
        </div>
    );
}
