import type {PropsWithChildren} from 'react';
import type {PageContent} from '@gravity-ui/page-constructor';

import React from 'react';
import block from 'bem-cn-lite';
import {
    BackgroundMedia,
    Col,
    ConstructorBlocks,
    Grid,
    Row,
    getThemedValue,
    useTheme,
} from '@gravity-ui/page-constructor';

const bPC = block('pc-page-constructor');
const bPCRow = block('pc-constructor-row');

export const ConstructorRow = ({children}: PropsWithChildren) =>
    children ? (
        <Row className={bPCRow()}>
            <Col>{children}</Col>
        </Row>
    ) : null;

export function ConstructorPage({background, blocks}: PageContent) {
    const theme = useTheme();
    const themedBackground = getThemedValue(background, theme);

    return (
        <div className={bPC('docs')}>
            <div className={bPC('wrapper')}>
                {blocks && themedBackground && (
                    <BackgroundMedia {...themedBackground} className={bPC('background')} />
                )}
                <Grid>
                    <ConstructorRow>
                        <ConstructorBlocks items={blocks} />
                    </ConstructorRow>
                </Grid>
            </div>
        </div>
    );
}
