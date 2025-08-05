import type {NavigationData, PageContent} from '@gravity-ui/page-constructor';
import type {Props as HeaderControlsProps} from '../HeaderControls';
import type {SearchConfig} from '../Search';
import type {RouterConfig} from '../Router';
import type {ReactElement} from 'react';
import type {
    DocBasePageData,
    DocContentPageData as DocContentPageDataBase,
    DocLeadingPageData,
    DocPageData,
    RenderBodyHook,
} from '@diplodoc/components';

import React, {useEffect, useMemo} from 'react';
import {ThemeProvider} from '@gravity-ui/uikit';
import {
    ConsentPopup,
    InterfaceProvider,
    Lang,
    RenderBodyHooksContext,
    SUPPORTED_LANGS,
    configure,
} from '@diplodoc/components';
import '@diplodoc/transform/dist/js/yfm';

import {SearchProvider} from '../Search';
import {RouterProvider} from '../Router';
import {
    getDirection,
    getLandingPage,
    linksHandler,
    scrollToHash,
    updateRootClassName,
    updateThemeClassName,
} from '../../utils';
import {LangProvider} from '../../hooks/useLang';
import '../../interceptors/leading-page-links';

import {LegacyNavPage, RichNavPage} from './Page';
import {Runtime} from './Runtime';
import {useLangs} from './useLangs';
import {useSettings} from './useSettings';
import {useMobile} from './useMobile';
import {withMdxInit} from './withMdxInit';
import './App.scss';

export type DocAnalytics = {
    gtm?: {
        id?: string;
        mode?: 'base' | 'notification';
    };
};

export interface AppProps {
    lang: `${Lang}` | Lang;
    langs: (`${Lang}` | Lang)[];
    router: RouterConfig;
    search?: SearchConfig;
    analytics?: DocAnalytics;
    viewerInterface?: Record<string, boolean>;
    skipHtmlExtension?: boolean;
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

function hasNavigation(
    data: DocBasePageData<Partial<WithNavigation>>,
): data is DocBasePageData<WithNavigation> {
    return Boolean(data.toc.navigation);
}

export function App(props: DocInnerProps): ReactElement {
    const {data, router, lang, search, analytics, viewerInterface, skipHtmlExtension} = props;
    const settings = useSettings();

    const langData = useLangs(props, skipHtmlExtension);
    const mobileView = useMobile();
    const fixedLang = SUPPORTED_LANGS.includes(lang) ? lang : Lang.En;

    configure({
        lang: fixedLang,
        localeCode: fixedLang,
    });

    const renderHooks = useMemo(() => {
        const hooks: RenderBodyHook[] = [];
        const getMdxInitProps = global && 'getMdxInitProps' in global && global.getMdxInitProps;
        if (typeof getMdxInitProps === 'function') {
            hooks.push(withMdxInit(getMdxInitProps({dependencies: {react: React}})));
        }
        return hooks;
    }, []);

    const {theme, textSize, wideFormat, fullScreen, showMiniToc} = settings;

    const page = useMemo(
        () => ({
            router,
            theme,
            textSize,
            wideFormat,
            fullScreen,
            showMiniToc,
            isMobile: mobileView,
        }),
        [router, theme, textSize, wideFormat, fullScreen, showMiniToc, mobileView],
    );
    const controls: HeaderControlsProps = useMemo(
        () => ({
            ...settings,
            ...langData,
            mobileView,
        }),
        [langData, settings, mobileView],
    );
    const direction = getDirection(lang);
    const landingPage = getLandingPage(data);

    useEffect(() => {
        updateRootClassName({mobileView, wideFormat, fullScreen, landingPage});
        updateThemeClassName({theme});
        scrollToHash();
        linksHandler(skipHtmlExtension);
    }, [theme, mobileView, wideFormat, fullScreen, landingPage, skipHtmlExtension]);

    return (
        <div className="App">
            <ThemeProvider theme={theme} direction={direction}>
                <LangProvider value={lang}>
                    <RouterProvider value={router}>
                        <SearchProvider value={search}>
                            <InterfaceProvider interface={viewerInterface || {}}>
                                <RenderBodyHooksContext.Provider value={renderHooks}>
                                    {hasNavigation(data) ? (
                                        <RichNavPage data={data} props={page} controls={controls} />
                                    ) : (
                                        <LegacyNavPage
                                            data={data}
                                            props={page}
                                            controls={controls}
                                        />
                                    )}
                                </RenderBodyHooksContext.Provider>
                                {analytics && (
                                    <ConsentPopup
                                        router={router}
                                        gtmId={analytics?.gtm?.id || ''}
                                        consentMode={analytics?.gtm?.mode}
                                    />
                                )}
                                <Runtime />
                            </InterfaceProvider>
                        </SearchProvider>
                    </RouterProvider>
                </LangProvider>
            </ThemeProvider>
        </div>
    );
}
