import React, {ReactElement, useCallback, useEffect, useState} from 'react';

import {
    DocLeadingPage,
    DocLeadingPageData,
    DocPage,
    DocPageData,
    Lang,
    Router,
    TextSizes,
    Theme,
} from '@diplodoc/components';
import {getDocSettings, updateRootClassName, withSavingSetting} from '../../utils';

import '../../interceptors/leading-page-links';

import '@diplodoc/transform/dist/js/yfm';
import {MermaidRuntime} from '@diplodoc/mermaid-extension/react';
import {Runtime as OpenapiSandbox} from '@diplodoc/openapi-extension/runtime';

import './App.scss';

export interface AppProps {
    lang: Lang;
    router: Router;
}

export type DocInnerProps<Data = DocLeadingPageData | DocPageData> =
    & { data: Data }
    & AppProps;

export type {DocLeadingPageData, DocPageData};

const MOBILE_VIEW_WIDTH_BREAKPOINT = 900;

export function App(props: DocInnerProps): ReactElement {
    const {data, router, lang} = props;

    const docSettings = getDocSettings();
    const [isMobileView, setIsMobileView] = useState(typeof document !== 'undefined' && document.body.clientWidth <= MOBILE_VIEW_WIDTH_BREAKPOINT);
    const [wideFormat, setWideFormat] = useState(docSettings.wideFormat);
    const [fullScreen, setFullScreen] = useState(docSettings.fullScreen);
    const [showMiniToc, setShowMiniToc] = useState(docSettings.showMiniToc);
    const [theme, setTheme] = useState(docSettings.theme);
    const [textSize, setTextSize] = useState(docSettings.textSize);
    const pageProps = {
        router,
        lang,
        headerHeight: 0,
        wideFormat,
        fullScreen,
        showMiniToc,
        theme,
        textSize,
        onChangeFullScreen: withSavingSetting<boolean>('fullScreen', setFullScreen),
        onChangeWideFormat: withSavingSetting<boolean>('wideFormat', setWideFormat),
        onChangeShowMiniToc: withSavingSetting<boolean>('showMiniToc', setShowMiniToc),
        onChangeTheme: withSavingSetting<Theme>('theme', setTheme),
        onChangeTextSize: withSavingSetting<TextSizes>('textSize', setTextSize),
    };

    const onResizeHandler = useCallback(() => {
        setIsMobileView(document.body.clientWidth <= MOBILE_VIEW_WIDTH_BREAKPOINT);
    }, []);

    useEffect(() => {
        window.addEventListener('resize', onResizeHandler);

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
