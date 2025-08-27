import React from 'react';
import {MermaidRuntime} from '@diplodoc/mermaid-extension/react';
import {LatexRuntime} from '@diplodoc/latex-extension/react';
import {Runtime as OpenapiSandbox} from '@diplodoc/openapi-extension/runtime';
import {Theme} from '@diplodoc/components';
import {useTheme} from '@gravity-ui/uikit';
import {TabsRuntime} from '@diplodoc/tabs-extension/react';
import {CutRuntime} from '@diplodoc/cut-extension/react';
import {PageConstructorRuntime} from '@diplodoc/page-constructor-extension/react';

export function Runtime() {
    const theme = useTheme();

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
            <TabsRuntime saveTabsToLocalStorage={true} saveTabsToQueryStateMode="page" />
            <CutRuntime offset={200} behavior="instant" />
            <PageConstructorRuntime />
        </>
    );
}
