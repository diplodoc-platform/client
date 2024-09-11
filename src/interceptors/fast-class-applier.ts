import {getMobileView, getSettings, updateRootClassName, updateThemeClassName} from '../utils';

if (typeof document !== 'undefined') {
    const {theme, wideFormat, fullScreen} = getSettings();
    const mobileView = getMobileView();

    updateRootClassName({mobileView, wideFormat, fullScreen});
    updateThemeClassName({theme});
}
