import type {ComponentType} from 'react';
import type {Analytics} from '@diplodoc/components';

import React from 'react';
import {AnalyticsProvider} from '@diplodoc/components';

export function withAnalyticsProvider<T extends {}>(Component: ComponentType<T>) {
    return function WithAnalyticsProvider(props: T & {analyticsService?: Analytics}) {
        const {analyticsService, ...otherProps} = props;

        if (!analyticsService) {
            return <Component {...(otherProps as T)} />;
        }

        return (
            <AnalyticsProvider value={analyticsService}>
                <Component {...(otherProps as T)} />
            </AnalyticsProvider>
        );
    };
}
