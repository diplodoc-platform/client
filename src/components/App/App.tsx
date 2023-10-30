import React, { useEffect, ReactElement } from 'react';

import {PageConstructor, PageConstructorProvider} from '@gravity-ui/page-constructor';
import {
    DocLeadingPage,
    DocLeadingPageData,
    DocPage,
    DocPageData,
    Lang,
    Router,
    Theme,
} from '@diplodoc/components';
import {HeaderControls} from './HeaderControls';
import {updateRootClassName} from '../../utils';

import '../../interceptors/leading-page-links';

import '@diplodoc/transform/dist/js/yfm';
import {MermaidRuntime} from '@diplodoc/mermaid-extension/react';
import {Runtime as OpenapiSandbox} from '@diplodoc/openapi-extension/runtime';

import './App.scss';
import Layout from '../Layout/Layout';
import { useSettings } from '../../hooks/useSettings';
import { useMobile } from '../../hooks/useMobile';

export interface AppProps {
    lang: Lang;
    router: Router;
}

export type DocInnerProps<Data = DocLeadingPageData | DocPageData> =
    & { data: Data }
    & AppProps;

export type {DocLeadingPageData, DocPageData};

function Page(props) {
    const {data, ...pageProps} = props;

    const Page = data.leading ? DocLeadingPage : DocPage;

    return <Layout>
        <Layout.Content>
            <Page { ...data } { ...pageProps} />
        </Layout.Content>
    </Layout>
}

export function App(props: DocInnerProps): ReactElement {
    const {data, router, lang} = props;
    const {navigation} = data.toc;

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

    useEffect(() => {
        updateRootClassName({
            theme,
            mobileView,
            wideFormat,
            fullHeader,
        });
    }, [theme, mobileView, wideFormat, fullHeader]);

    const {header = {}, logo = {}} = navigation;
    const {leftItems = [], rightItems = []} = header;
    const headerWithControls = rightItems.some((item) => item.type === 'controls');

    return (
        <div className="App">
            <PageConstructorProvider theme={ theme }>
                <PageConstructor
                    custom={ {
                        navigation: {
                            controls: () => <HeaderControls { ...settings } mobileView={mobileView} />,
                        },
                        blocks: {
                            page: () => <Page { ...pageProps } { ...(headerWithControls ? {} : settings) } />,
                        },
                    } }
                    content={ {
                        blocks: [
                            {
                                type: 'page',
                            },
                        ],
                    } }
                    navigation={ fullHeader ? {
                        header: {
                            withBorder: true,
                            leftItems,
                            rightItems,
                        },
                        logo,
                    } : undefined }
                />
            </PageConstructorProvider>
            <OpenapiSandbox/>
            <MermaidRuntime
                theme={ theme === Theme.Dark ? 'dark' : 'neutral' }
                zoom={ {
                    showMenu: true,
                    bindKeys: true,
                } }
            />
        </div>
    );
}
