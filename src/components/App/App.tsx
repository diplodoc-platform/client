import React, {ReactElement, useEffect} from 'react';

import {
    NavigationData,
    PageConstructor,
    PageConstructorProvider,
} from '@gravity-ui/page-constructor';
import {
    DocLeadingPage,
    DocLeadingPageData,
    DocPage,
    DocPageData,
    Lang,
    Router,
    Theme,
} from '@diplodoc/components';
import {HeaderControls} from '../HeaderControls';
import {updateRootClassName} from '../../utils';
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
    router: Router;
}

export type DocInnerProps<Data = DocLeadingPageData | DocPageData> = {
    data: Data;
} & AppProps;

export type {DocLeadingPageData, DocPageData};

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
    };

    const rebase = (item: any) => {
        if (item.type !== 'link') {
            return item;
        }

        return {
            ...item,
            url: item.url.replace(/^\/?/, '/'),
        };
    };

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
                <Page {...pageProps} {...settings} />
            </div>
        );
    }

    const {header = {}, logo} = navigation;
    const {leftItems = [], rightItems = []} = header as NavigationData['header'];
    const headerWithControls = rightItems.some((item: {type: string}) => item.type === 'controls');

    return (
        <div className="App">
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
                                <Page {...pageProps} {...(headerWithControls ? {} : settings)} />
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
                                      leftItems: leftItems.map(rebase),
                                      rightItems: rightItems.map(rebase),
                                  },
                                  logo,
                              }
                            : undefined
                    }
                />
            </PageConstructorProvider>
            <OpenapiSandbox />
            <LatexRuntime />
            <MermaidRuntime
                theme={theme === Theme.Dark ? 'dark' : 'neutral'}
                zoom={{
                    showMenu: true,
                    bindKeys: true,
                }}
            />
        </div>
    );
}
