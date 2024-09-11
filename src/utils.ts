import {Lang, Theme} from '@diplodoc/components';

import {
    DEFAULT_USER_SETTINGS,
    MOBILE_VIEW_WIDTH_BREAKPOINT,
    RTL_LANGS,
    TextDirection,
} from './constants';

export function isBrowser() {
    return typeof document !== 'undefined';
}

export function updateThemeClassName({theme}: {theme: Theme}) {
    if (typeof document === 'undefined') {
        return;
    }

    document.querySelectorAll('.g-root').forEach((el) => {
        el.classList.toggle('g-root_theme_light', theme === 'light');
        el.classList.toggle('g-root_theme_dark', theme === 'dark');
    });
}

export function updateRootClassName(states: {
    mobileView?: boolean;
    wideFormat?: boolean;
    fullScreen?: boolean;
    focusSearch?: boolean;
}) {
    if (!isBrowser()) {
        return;
    }

    document.body.classList.add('g-root');

    const toggle = (name: string, state: unknown) =>
        document.body.classList.toggle(name, Boolean(state));

    Object.keys(states).forEach((state) => {
        switch (state) {
            case 'wideFormat':
                toggle('dc-root_wide-format', states[state]);
                break;
            case 'focusSearch':
                toggle('dc-root_focused-search', states[state]);
                break;
            case 'fullScreen':
                toggle('dc-root_full-screen', states[state]);
                break;
            case 'mobileView':
                toggle('mobile', states[state]);
                toggle('desktop', !states[state]);
                break;
        }
    });
}

export function getDirection(lang: Lang): TextDirection {
    const isRTL = RTL_LANGS.includes(lang);

    return isRTL ? TextDirection.RTL : TextDirection.LTR;
}

const toBoolean = (str: string | boolean) => {
    if (typeof str === 'boolean') {
        return str;
    }

    return str ? str === 'true' : false;
};

export type Settings = typeof DEFAULT_USER_SETTINGS;

export function getSettings() {
    const theme = getSetting('theme');
    const textSize = getSetting('textSize');
    const showMiniToc = getSetting('showMiniToc');
    const wideFormat = getSetting('wideFormat');
    const fullScreen = getSetting('fullScreen');

    return {
        theme,
        textSize,
        showMiniToc: toBoolean(showMiniToc),
        wideFormat: toBoolean(wideFormat),
        fullScreen: toBoolean(fullScreen),
    };
}

export function getMobileView() {
    if (!isBrowser()) {
        return false;
    }

    return document.body.clientWidth < MOBILE_VIEW_WIDTH_BREAKPOINT;
}

function getSetting<T extends keyof Settings>(name: T): Settings[T] {
    if (!isBrowser()) {
        return DEFAULT_USER_SETTINGS[name];
    }

    try {
        return (sessionStorage.getItem(name) as Settings[T]) || DEFAULT_USER_SETTINGS[name];
    } catch {
        return DEFAULT_USER_SETTINGS[name];
    }
}

export function setSetting<T>(name: string, value: T) {
    if (!isBrowser()) {
        return;
    }

    try {
        sessionStorage.setItem(name, String(value));
    } catch {}
}
