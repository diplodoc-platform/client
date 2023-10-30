import React, { useEffect, ReactElement } from 'react';

import {
    DocLeadingPage,
    DocLeadingPageData,
    DocPage,
    DocPageData,
    Lang,
    Router,
    Theme,
} from '@diplodoc/components';
import {updateRootClassName} from '../../utils';

import '../../interceptors/leading-page-links';

import '@diplodoc/transform/dist/js/yfm';
import {MermaidRuntime} from '@diplodoc/mermaid-extension/react';
import {Runtime as OpenapiSandbox} from '@diplodoc/openapi-extension/runtime';

import './App.scss';
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


export function App(props: DocInnerProps): ReactElement {
    const {data, router, lang} = props;

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

        return () => window.removeEventListener('resize', onResizeHandler);
    }, []);

    useEffect(() => {
        updateRootClassName(theme, isMobileView);
    }, [theme, isMobileView]);

    return (
        // TODO(vladimirfedin): Replace Layout__content class.
        <div className="App Layout__content">
            { data.leading
                ? <DocLeadingPage { ...data } { ...pageProps }/>
                // @ts-ignore
                : <DocPage { ...data } { ...pageProps }/>
            }
            <OpenapiSandbox/>
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
