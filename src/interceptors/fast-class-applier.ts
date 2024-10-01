import type {DocInnerProps} from '../components/App';

import {
    getLandingPage,
    getMobileView,
    getSettings,
    updateRootClassName,
    updateThemeClassName,
} from '../utils';

export function setRootClasses(data: DocInnerProps) {
    const {theme, wideFormat, fullScreen} = getSettings();
    const mobileView = getMobileView();
    const landingPage = getLandingPage(data.data);

    updateRootClassName({mobileView, wideFormat, fullScreen, landingPage});
    updateThemeClassName({theme});
}
