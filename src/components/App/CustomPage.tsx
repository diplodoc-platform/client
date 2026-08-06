import type {FC} from 'react';
import type {CustomFooterProps} from '@diplodoc/components';
import type {CustomPageProps} from './PageContext';
import type {DocContentPageData} from './index';

import {useCallback} from 'react';
import {CustomFooter, getPageByType, getPageType} from '@diplodoc/components';

import {Layout} from '../Layout';
import {ConstructorPage} from '../ConstructorPage';
import {useProvider} from '../Search/useProvider';

import {usePageContext} from './PageContext';

export const CustomPage = () => {
    const {data, props, hasLayout} = usePageContext();
    const searchProvider = useProvider();
    const getSearchLink = useCallback(
        (query: string, page?: number, tags?: string[]) =>
            searchProvider?.link(query, page, tags) ?? null,
        [searchProvider],
    );
    const type = getPageType(data);
    const PageComponent = getPageByType(type) as FC<CustomPageProps>;
    const headerHeight = props.fullScreen || !hasLayout ? 0 : 64;
    const pageProps = {...data, ...props, getSearchLink};
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
