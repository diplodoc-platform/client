import React, {ReactElement, useCallback, useEffect} from 'react';

import {
    NavigationData,
    PageConstructor,
    PageConstructorProvider,
    PageContent,
} from '@gravity-ui/page-constructor';
import {ThemeProvider} from '@gravity-ui/uikit';
import {
    ConsentPopup,
    DocContentPageData,
    DocLeadingPageData,
    DocPageData,
    DocumentType,
    Lang,
    Router,
    Theme,
    configure,
    getLangPath,
    getPageByType,
    getPageType,
} from '@diplodoc/components';

import {HeaderControls} from '../HeaderControls';
import {getDirection, updateRootClassName} from '../../utils';
import {Layout} from '../Layout';
import {useSettings} from '../../hooks/useSettings';
import {useMobile} from '../../hooks/useMobile';

import '../../interceptors/leading-page-links';

import '@diplodoc/transform/dist/js/yfm';
import {MermaidRuntime} from '@diplodoc/mermaid-extension/react';
import {LatexRuntime} from '@diplodoc/latex-extension/react';
import {Runtime as OpenapiSandbox} from '@diplodoc/openapi-extension/runtime';

import './App.scss';
import {ConstructorPage} from '../ConstructorPage';

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
    type: DocumentType;
    analytics?: DocAnalytics;
}

export interface PageContentData extends DocContentPageData {
    data: PageContent & {fullScreen?: boolean};
}

export type DocInnerProps<Data = DocLeadingPageData | DocPageData | PageContentData> = {
    data: Data;
} & AppProps;

export type {DocLeadingPageData, DocPageData};

type RuntimeProps = {
    theme: Theme;
};

function Runtime(props: RuntimeProps) {
    const {theme} = props;

    return (
        <>
            <OpenapiSandbox />
            <LatexRuntime />
            <MermaidRuntime
                theme={theme === Theme.Dark ? 'dark' : 'neutral'}
                zoom={{
                    showMenu: true,
                    bindKeys: true,
                }}
            />
        </>
    );
}

export function Page(props: DocInnerProps) {
    const {data, ...pageProps} = props;
    const Page = getPageByType(props?.type);

    return (
        <Layout>
            <Layout.Content>
                {/*@ts-ignore*/}
                <Page {...data} {...pageProps} />
            </Layout.Content>
        </Layout>
    );
}

type TocData = DocPageData['toc'] & {
    navigation?: NavigationData;
};

export function App(props: DocInnerProps): ReactElement {
    const {data, router, lang, langs, analytics} = props;
    const {navigation} = data.toc as TocData;

    configure({
        lang,
    });

    const settings = useSettings();
    const mobileView = useMobile();

    const onChangeLang = useCallback(
        (lang: Lang) => {
            const path = getLangPath(router, lang);
            window.location.replace(path);
        },
        [router],
    );

    const {theme, textSize, wideFormat, fullScreen, showMiniToc, onChangeFullScreen} = settings;
    const fullHeader = !fullScreen && Boolean(navigation);
    const headerHeight = fullHeader ? 64 : 0;
    const type = getPageType(data);

    const pageProps = {
        headerHeight,
        data,
        router,
        lang,
        langs,
        wideFormat,
        showMiniToc,
        theme,
        textSize,
        fullScreen,
        onChangeFullScreen,
        type,
    };
    const direction = getDirection(lang);
    const fullScreenPC =
        type === DocumentType.PageConstructor &&
        'data' in data &&
        'fullScreen' in data.data &&
        data.data.fullScreen;
    const appClassName = `App ${fullScreenPC ? 'fullscreen-mode' : 'document-mode'}`;

    useEffect(() => {
        updateRootClassName({
            theme,
            mobileView,
            wideFormat,
            fullHeader,
        });
    }, [theme, mobileView, wideFormat, fullHeader]);

    const pageContext = {
        ...settings,
        onChangeLang,
    };

    if (!navigation) {
        return (
            <div className={appClassName}>
                <ThemeProvider theme={theme} direction={direction}>
                    <Page {...pageProps} {...pageContext}>
                        {type === DocumentType.PageConstructor && (
                            <PageConstructorProvider theme={theme}>
                                <PageConstructor
                                    custom={{
                                        blocks: {
                                            page: () => (
                                                <ConstructorPage
                                                    data={data as PageContentData}
                                                    theme={theme}
                                                />
                                            ),
                                        },
                                    }}
                                    content={
                                        fullScreenPC
                                            ? (data.data as PageContent)
                                            : {
                                                  blocks: [
                                                      {
                                                          type: 'page',
                                                          resetPaddings: true,
                                                      },
                                                  ],
                                              }
                                    }
                                />
                            </PageConstructorProvider>
                        )}
                    </Page>
                    <ConsentPopup router={router} gtmId={analytics?.gtm?.id || ''} consentMode={analytics?.gtm?.mode} />
                    <Runtime theme={theme} />
                </ThemeProvider>
            </div>
        );
    }

    const {header = {}, logo} = navigation;
    const {leftItems = [], rightItems = []} = header as NavigationData['header'];
    const headerWithControls = rightItems.some((item: {type: string}) => item.type === 'controls');

    return (
        <div className={appClassName}>
            <ThemeProvider theme={theme} direction={direction}>
                <PageConstructorProvider theme={theme}>
                    <PageConstructor
                        custom={{
                            navigation: {
                                controls: () => (
                                    <HeaderControls
                                        {...pageContext}
                                        {...pageProps}
                                        onChangeLang={onChangeLang}
                                        mobileView={mobileView}
                                    />
                                ),
                            },
                            blocks: {
                                page: () => (
                                    <Page
                                        {...pageProps}
                                        {...(headerWithControls ? {} : pageContext)}
                                    >
                                        {type === DocumentType.PageConstructor &&
                                            'data' in data && (
                                                <ConstructorPage
                                                    data={data as PageContentData}
                                                    theme={theme}
                                                />
                                            )}
                                    </Page>
                                ),
                            },
                        }}
                        content={
                            fullScreenPC
                                ? (data.data as PageContent)
                                : {
                                      blocks: [
                                          {
                                              type: 'page',
                                              resetPaddings: true,
                                          },
                                      ],
                                  }
                        }
                        navigation={
                            fullHeader
                                ? {
                                      header: {
                                          withBorder: true,
                                          leftItems: leftItems,
                                          rightItems: rightItems,
                                      },
                                      logo,
                                  }
                                : undefined
                        }
                    />
                </PageConstructorProvider>
                <ConsentPopup router={router} gtmId={analytics?.gtm?.id || ''} consentMode={analytics?.gtm?.mode}/>
            </ThemeProvider>
            <Runtime theme={theme} />
        </div>
    );
}
