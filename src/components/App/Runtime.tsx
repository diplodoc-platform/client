import React from 'react';
import {MermaidRuntime} from '@diplodoc/mermaid-extension/react';
import {LatexRuntime} from '@diplodoc/latex-extension/react';
import {Runtime as OpenapiSandbox} from '@diplodoc/openapi-extension/runtime';
import {Theme} from '@diplodoc/components';

type RuntimeProps = {
    theme: Theme;
};

export function Runtime(props: RuntimeProps) {
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
