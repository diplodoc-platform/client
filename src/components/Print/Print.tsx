import React, { ReactElement } from 'react';

import { DocLeadingPage, DocLeadingPageData, DocPage, DocPageData, Lang, Router } from '@diplodoc/components';

import '@diplodoc/transform/dist/js/yfm';
import { MermaidRuntime } from '@diplodoc/mermaid-extension/react';
import { LatexRuntime } from '@diplodoc/latex-extension/react';

import './Print.scss';

export type DocInnerProps<Data = DocLeadingPageData | DocPageData> = {
    data: Data;
    lang: Lang;
    router: Router;
};

export function Runtime() {
    return (
        <>
            <LatexRuntime />
            <MermaidRuntime />
        </>
    );
}

function Page(props: DocInnerProps) {
    const {data, router, lang} = props;

    const Page = data.leading ? DocLeadingPage : DocPage;

    const _props = {
        router,
        lang,
        toc: null,
        fullScreen: true,
        singlePage: true,
        wideFormat: false,
        hideMiniToc: true,
        hideContributors: true,
        renderLoader: null,
    }

    // @ts-ignore
    return (<Page {...data} {..._props} />);
}

export function Print(props: DocInnerProps): ReactElement {
    const {data, router, lang} = props;

    return (<Page {...{data, router, lang}} />);
}
