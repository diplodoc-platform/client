import type {RenderBodyHook} from '@diplodoc/components';

import React, {useCallback, useRef} from 'react';
import {type MdxArtifacts, type UseMdxSsrProps, useMdx} from '@diplodoc/mdx-extension/build/esm';

export type WithMdxSsrInitProps = {
    components?: UseMdxSsrProps['components'];
    pureComponents?: UseMdxSsrProps['pureComponents'];
};

export const withMdxInit = ({components, pureComponents}: WithMdxSsrInitProps) => {
    const withMdx: RenderBodyHook = (Component) => {
        return function MdxWrapper(props) {
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

            useMdx({
                refCtr,
                components,
                pureComponents,
                mdxArtifacts: mdxArtifacts as MdxArtifacts | undefined,
                html,
            });

            return React.createElement(Component, {...props, forwardRef: forwardRefWrap, html: ''});
        };
    };
    return withMdx;
};
