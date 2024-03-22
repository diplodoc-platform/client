import React, {ReactElement, useEffect} from 'react';

import {
    NavigationData,
    NavigationDropdownItem,
    NavigationItemModel,
    PageConstructor,
    PageConstructorProvider,
    PageContent,
} from '@gravity-ui/page-constructor';
import {ThemeProvider} from '@gravity-ui/uikit';
import {
    DocContentPageData,
    DocLeadingPageData,
    DocPageData,
    DocumentType,
    Lang,
    Router,
    Theme,
    getPageByType,
    getPageType
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
import {ConstructorPage} from "../ConstructorPage";

export interface AppProps {
    lang: Lang;
    router: Router;
    type: DocumentType;
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

function isDropdownItem(item: NavigationItemModel): item is NavigationDropdownItem {
    return Array.isArray((item as NavigationDropdownItem).items);
}

function rebaseNavItem<T extends NavigationItemModel>(item: T) {
    const result: T = {...item};

    if (isDropdownItem(item)) {
        (result as NavigationDropdownItem).items = item.items.map(rebaseNavItem);
    }

    if (item.url !== undefined) {
        result.url = item.url.replace(/^\/?/, '/');
    }

    return result;
}

type TocData = DocPageData['toc'] & {
    navigation?: NavigationData;
};

export function App(props: DocInnerProps): ReactElement {
    const {data, router, lang} = props;
    const {navigation} = data.toc as TocData;

    const settings = useSettings();
    const mobileView = useMobile();

    const {theme, textSize, wideFormat, fullScreen, showMiniToc, onChangeFullScreen} = settings;
    const fullHeader = !fullScreen && Boolean(navigation);
    const headerHeight = fullHeader ? 64 : 0;
    const type = getPageType(data);

    const pageProps = {
        headerHeight,
        data,
        router,
        lang,
        wideFormat,
        showMiniToc,
        theme,
        textSize,
        fullScreen,
        onChangeFullScreen,
        type,
    };
    const direction = getDirection(lang);

    useEffect(() => {
        updateRootClassName({
            theme,
            mobileView,
            wideFormat,
            fullHeader,
        });
    }, [theme, mobileView, wideFormat, fullHeader]);

    if (!navigation) {
        return (
            <div className="App">
                <ThemeProvider theme={theme} direction={direction}>
                    <Page {...pageProps} {...settings} >
                        {type === DocumentType.PageConstructor && <ConstructorPage data={data as PageContentData} theme={theme} />}
                    </Page>
                    <Runtime theme={theme} />
                </ThemeProvider>
            </div>
        );
    }

    const {header = {}, logo} = navigation;
    const {leftItems = [], rightItems = []} = header as NavigationData['header'];
    const headerWithControls = rightItems.some((item: {type: string}) => item.type === 'controls');
    const fullScreenPC = type === DocumentType.PageConstructor && 'data' in data && 'fullScreen' in data.data && data.data.fullScreen;

    return (
        <div className="App">
            <ThemeProvider theme={theme} direction={direction}>
                <PageConstructorProvider theme={theme}>
                    <PageConstructor
                        custom={{
                            navigation: {
                                controls: () => (
                                    <HeaderControls {...settings} mobileView={mobileView} />
                                ),
                            },
                            blocks: {
                                page: () => (
                                    <Page
                                        {...pageProps}
                                        {...(headerWithControls ? {} : settings)}
                                    >
                                        {type === DocumentType.PageConstructor && 'data' in data && <ConstructorPage data={data as PageContentData} theme={theme} />}
                                    </Page>
                                ),
                            },
                        }}
                        content={fullScreenPC ? data.data as PageContent : {
                            blocks: [
                                {
                                    type: 'page',
                                },
                            ],
                        }}
                        navigation={
                            fullHeader
                                ? {
                                      header: {
                                          withBorder: true,
                                          leftItems: leftItems.map(rebaseNavItem),
                                          rightItems: rightItems.map(rebaseNavItem),
                                      },
                                      logo,
                                  }
                                : undefined
                        }
                    />
                </PageConstructorProvider>
            </ThemeProvider>
            <Runtime theme={theme} />
        </div>
    );
}
