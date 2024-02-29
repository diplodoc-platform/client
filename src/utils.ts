import {Lang, Theme} from '@diplodoc/components';
import {RTL_LANGS, TextDirection} from './constants';

export function strToBoolean(str: string | boolean) {
    if (typeof str === 'boolean') {
        return str;
    }

    return str ? str === 'true' : false;
}

export function updateRootClassName({
    theme,
    mobileView = false,
    wideFormat = false,
    fullHeader = false,
}: {
    theme: Theme;
    mobileView: boolean;
    wideFormat: boolean;
    fullHeader: boolean;
}) {
    document.body.className = [
        'g-root',
        mobileView ? 'mobile' : 'desktop',
        wideFormat && 'dc-root_wide-format',
        fullHeader && 'dc-root_full-header',
        theme === 'light' && 'g-root_theme_light',
        theme === 'dark' && 'g-root_theme_dark',
    ]
        .filter(Boolean)
        .join(' ');
}

export function getDirection(lang: Lang): TextDirection {
    const isRTL = RTL_LANGS.includes(lang);

    return isRTL ? TextDirection.RTL : TextDirection.LTR;
}
