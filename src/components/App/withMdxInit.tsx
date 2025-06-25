import type {RenderBodyHook} from '@diplodoc/components';

import React, {useCallback, useRef} from 'react';
import {type MdxArtifacts, type UseMdxSsrProps, useMdxSsr} from '@diplodoc/mdx-extension';

export type WithMdxInitProps = Pick<UseMdxSsrProps, 'components' | 'pureComponents'>;

export const withMdxInit = ({components, pureComponents}: WithMdxInitProps) => {
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
    return withMdx;
};
