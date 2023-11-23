import {useCallback, useEffect, useState} from 'react';

const MOBILE_VIEW_WIDTH_BREAKPOINT = 769;

export function useMobile() {
    const [mobileView, setMobileView] = useState<boolean>(
        typeof document !== 'undefined' && document.body.clientWidth < MOBILE_VIEW_WIDTH_BREAKPOINT,
    );

    const onResizeHandler = useCallback(() => {
        setMobileView(document.body.clientWidth < MOBILE_VIEW_WIDTH_BREAKPOINT);
    }, []);

    useEffect(onResizeHandler, [onResizeHandler]);

    useEffect(() => {
        window.addEventListener('resize', onResizeHandler);

        return () => window.removeEventListener('resize', onResizeHandler);
    }, [onResizeHandler]);

    return mobileView;
}
