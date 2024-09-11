import {useCallback, useEffect, useState} from 'react';

import {getMobileView} from '../../utils';

export function useMobile() {
    const [mobileView, setMobileView] = useState<boolean>(getMobileView());

    const onResizeHandler = useCallback(() => {
        setMobileView(getMobileView());
    }, []);

    useEffect(onResizeHandler, [onResizeHandler]);

    useEffect(() => {
        window.addEventListener('resize', onResizeHandler);

        return () => window.removeEventListener('resize', onResizeHandler);
    }, [onResizeHandler]);

    return mobileView;
}
