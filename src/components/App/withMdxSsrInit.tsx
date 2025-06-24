import type {RenderBodyHook} from '@diplodoc/components';

import React, {useCallback, useRef} from 'react';
import {type MdxArtifacts, type UseMdxSsrProps, useMdxSsr} from '@diplodoc/mdx-extension';

export type WithMdxSsrInitProps = {
    components?: UseMdxSsrProps['components'];
    pureComponents?: UseMdxSsrProps['pureComponents'];
};

export const withMdxSsrInit = ({components, pureComponents}: WithMdxSsrInitProps) => {
    const withMdxSsr: RenderBodyHook = (Component) => {
        return function MdxSsrWrapper(props) {
            const {forwardRef, mdxArtifacts, html} = props;
            const refCtr = useRef<HTMLDivElement | null>(null);
            refCtr.current = null;

            const forwardRefWrap = useCallback(
                (v: HTMLDivElement) => {
                    refCtr.current = v;
                    return forwardRef(v);
                },
                [forwardRef],
            );

            useMdxSsr({
                refCtr,
                components,
                pureComponents,
                mdxArtifacts: mdxArtifacts as MdxArtifacts | undefined,
                html,
            });

            return React.createElement(Component, {...props, forwardRef: forwardRefWrap});
        };
    };
    return withMdxSsr;
};
