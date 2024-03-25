import React, {ReactElement, useCallback, useEffect} from 'react';

import {
    NavigationData,
    NavigationDropdownItem,
    NavigationItemModel,
    PageConstructor,
    PageConstructorProvider,
} from '@gravity-ui/page-constructor';
import {ThemeProvider} from '@gravity-ui/uikit';
import {
    DocLeadingPage,
    DocLeadingPageData,
    DocPage,
    DocPageData,
    Lang,
    Router,
    Theme,
    getLangPath,
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

export interface AppProps {
    lang: Lang;
    langs: Lang[];
    router: Router;
}

export type DocInnerProps<Data = DocLeadingPageData | DocPageData> = {
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

function Page(props: DocInnerProps) {
    const {data, ...pageProps} = props;
    const Page = data.leading ? DocLeadingPage : DocPage;

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
    const {data, router, lang, langs} = props;
    const {navigation} = data.toc as TocData;

    const settings = useSettings();
    const mobileView = useMobile();

    const onChangeLang = useCallback((lang: Lang) => {
        window.location.replace(getLangPath(router, lang));
    }, []);

    const {theme, textSize, wideFormat, fullScreen, showMiniToc, onChangeFullScreen} = settings;
    const fullHeader = !fullScreen && Boolean(navigation);
    const headerHeight = fullHeader ? 64 : 0;
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

    const pageContext = {
        ...settings,
        onChangeLang,
    }
console.log("here", router);

    if (!navigation) {
        return (
            <div className="App">
                <ThemeProvider theme={theme} direction={direction}>
                    <Page {...pageProps} {...pageContext} />
                    <Runtime theme={theme} />
                </ThemeProvider>
            </div>
        );
    }

    const {header = {}, logo} = navigation;
    const {leftItems = [], rightItems = []} = header as NavigationData['header'];
    const headerWithControls = rightItems.some((item: {type: string}) => item.type === 'controls');

    return (
        <div className="App">
            <ThemeProvider theme={theme} direction={direction}>
                <PageConstructorProvider theme={theme}>
                    <PageConstructor
                        custom={{
                            navigation: {
                                controls: () => (
                                    <HeaderControls {...pageContext} {...pageProps} onChangeLang={onChangeLang} mobileView={mobileView} />
                                ),
                            },
                            blocks: {
                                page: () => (
                                    <Page
                                        {...pageProps}
                                        {...(headerWithControls ? {} : pageContext)}
                                    />
                                ),
                            },
                        }}
                        content={{
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
