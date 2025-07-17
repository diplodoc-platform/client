import type {PageData} from './components/App';
import type {Lang, Theme} from '@diplodoc/components';

import {getPageType} from '@diplodoc/components';

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
    landingPage?: boolean;
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
            case 'landingPage':
                toggle('dc-root_document-page', !states[state]);
                toggle('dc-root_landing-page', states[state]);
                break;
            case 'mobileView':
                toggle('mobile', states[state]);
                toggle('desktop', !states[state]);
                break;
        }
    });
}

export function getDirection(lang: `${Lang}` | Lang): TextDirection {
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

export function getLandingPage(data: PageData) {
    return getPageType(data) === 'PAGE_CONSTRUCTOR';
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

export function isHeaderTag(el: HTMLElement) {
    if (!el) return false;

    return ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].indexOf(el.tagName) !== -1;
}

export function isCutTag(el: HTMLElement) {
    if (!el) return false;

    return el.matches('.yfm-cut');
}

export function focusActiveTab(cutNode: HTMLElement) {
    cutNode.classList.toggle('open');
    cutNode.setAttribute('open', 'true');
    cutNode.classList.add('cut-highlight');

    cutNode.scrollIntoView(true);
    window.scrollBy(0, -100);

    setTimeout(() => {
        cutNode.classList.remove('cut-highlight');
    }, 1_000);
}

/**
 * Scrolls to the element.
 * If the element is a heading - simply scrolls to it, since needed offset is already in css.
 * If the element is of any other type - calculate the offset form the element position in heading and scroll to it.
 * @param {HTMLElement} el
 */

export function scrollToElement(el: HTMLElement | null) {
    if (!el) return;

    if (isHeaderTag(el)) {
        // Header already includes the offset in css
        // That puts it where we want it when it's scrolled to
        el.scrollIntoView();
    } else if (isCutTag(el)) {
        focusActiveTab(el);
    } else {
        // For elements other than headers calculate the offset
        const [header] = document.getElementsByClassName('Layout__header');
        const headerOffset = header?.clientHeight ?? 0;
        const anchorPosition = el.offsetTop;
        window.scrollTo(0, anchorPosition - headerOffset);
    }
}

export function scrollToHash() {
    const hash = window.location.hash.substring(1);

    if (hash) {
        const element = document.getElementById(hash);

        scrollToElement(element);
    }
}
