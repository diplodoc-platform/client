import React from 'react';

import block from 'bem-cn-lite';
import {
    BackgroundMedia,
    Col,
    ConstructorBlocks,
    Grid,
    Row,
    Theme,
    getThemedValue
} from "@gravity-ui/page-constructor";
import { PageContentData } from '../App/App';

export type WithChildren<T = {}> = T & {children?: React.ReactNode};

const bPC = block('pc-page-constructor');
const bPCRow = block('pc-constructor-row');

export const ConstructorRow = ({children}: WithChildren<{}>) =>
    children ? (
        <Row className={bPCRow()}>
            <Col>{children}</Col>
        </Row>
    ) : null;


export function ConstructorPage({data: {data}, theme}: {data: PageContentData; theme: Theme}) {
    const themedBackground = getThemedValue(data?.background, theme);

    return (
        <div className={bPC('')}>
            <div className={bPC('wrapper')}>
                {data?.blocks && themedBackground && (
                    <BackgroundMedia
                        {...themedBackground}
                        className={bPC('background')}
                    />
                )}
                <Grid>
                    <ConstructorRow>
                        <ConstructorBlocks items={data?.blocks} />
                    </ConstructorRow>
                </Grid>
            </div>
        </div>
   )
}
