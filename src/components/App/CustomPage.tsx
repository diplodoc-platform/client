import type {FC} from 'react';
import type {CustomFooterProps} from '@diplodoc/components';
import type {CustomPageProps} from './PageContext';
import type {DocContentPageData} from './index';

import React from 'react';
import {CustomFooter, getPageByType, getPageType} from '@diplodoc/components';

import {Layout} from '../Layout';
import {ConstructorPage} from '../ConstructorPage';

import {usePageContext} from './PageContext';

export const CustomPage = () => {
    const {data, props, hasLayout} = usePageContext();
    const type = getPageType(data);
    const PageComponent = getPageByType(type) as FC<CustomPageProps>;
    const headerHeight = props.fullScreen || !hasLayout ? 0 : 64;
    const pageProps = {...data, ...props};
    const navigation = (data.toc as {navigation?: {footer?: CustomFooterProps}}).navigation;
    const footer = navigation?.footer;

    return (
        <Layout key="layout" headerHeight={headerHeight}>
            <Layout.Content>
                <PageComponent {...pageProps}>
                    <ConstructorPage {...(data as DocContentPageData).data} />
                </PageComponent>
            </Layout.Content>
            {footer && !props.fullScreen && (
                <Layout.Footer>
                    <CustomFooter {...footer} />
                </Layout.Footer>
            )}
        </Layout>
    );
};
