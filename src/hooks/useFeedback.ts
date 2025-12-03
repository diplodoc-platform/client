import type {FeedbackSendData} from '@diplodoc/components';
import type {RouterConfig} from '../components/Router';

import {useCallback} from 'react';

interface UseFeedbackOptions {
    feedbackUrl?: string;
    router: RouterConfig;
    viewerInterface?: Record<string, boolean>;
}

export function useFeedback({feedbackUrl, router, viewerInterface}: UseFeedbackOptions) {
    const onSendFeedback = useCallback(
        (data: FeedbackSendData) => {
            if (!feedbackUrl) {
                return;
            }

            fetch(feedbackUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...data,
                    page: router.pathname,
                    timestamp: new Date().toISOString(),
                }),
            }).catch((error) => {
                // eslint-disable-next-line no-console
                console.error('Failed to send feedback:', error);
            });
        },
        [feedbackUrl, router.pathname],
    );

    const isFeedbackEnabled = viewerInterface?.feedback !== false;
    return feedbackUrl && isFeedbackEnabled ? onSendFeedback : undefined;
}
