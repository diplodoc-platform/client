import type {AppProps, PageData} from './index';
import type {PropsWithChildren} from 'react';

import React from 'react';
import {getPageByType, getPageType} from '@diplodoc/components';

import {Layout} from '../Layout';

type Props = PropsWithChildren<Partial<AppProps> & {data: PageData; headerHeight: number}>;

export function Page({data, ...pageProps}: Props) {
    const type = getPageType(data);
    const Page = getPageByType(type);

    return (
        <Layout headerHeight={pageProps.headerHeight}>
            <Layout.Content>
                {/*@ts-ignore*/}
                <Page {...data} {...pageProps} />
            </Layout.Content>
        </Layout>
    );
}
