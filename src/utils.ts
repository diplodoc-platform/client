import type {PageData} from './components/App';
import type {Lang, NeuroExpert, NeuroExpertSettings, Theme} from '@diplodoc/components';

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

export function isDetailsTag(el: HTMLElement): el is HTMLDetailsElement {
    return el?.tagName.toLowerCase() === 'details';
}

export function isHeaderTag(el: HTMLElement) {
    return ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].indexOf(el.tagName) !== -1;
}

/**
 * Scrolls to the element.
 * If the element is a heading - simply scrolls to it, since needed offset is already in css.
 * If the element is of any other type - calculate the offset form the element position in heading and scroll to it.
 * @param {HTMLElement} el
 */

export function scrollToElement(el: HTMLElement, offset = 200) {
    if (isInViewport(el)) {
        return;
    }

    if (isHeaderTag(el)) {
        // Header already includes the offset in css
        // That puts it where we want it when it's scrolled to
        el.scrollIntoView();
    } else {
        const elementPosition = el.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - offset;

        window.scrollTo({
            top: offsetPosition,
        });
    }
}

export function getLangPath(lang: string, href: string) {
    let path;

    const isLocal = href.match(/^file:\/\/\/(.*)$/);

    if (isLocal) {
        path = '/' + isLocal[1];
    } else {
        path = href.replace(/^https?:\/\/[^/]+/, '');
    }

    const newPath = path.replace(/\/[a-z]{2}\//, `/${lang}/`);

    if (isLocal) {
        return 'file://' + newPath;
    }

    return newPath;
}

function isInViewport(el: HTMLElement) {
    const rect = el.getBoundingClientRect();

    return (
        rect.top >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
    );
}

export function scrollToHash() {
    const hash = window.location.hash.substring(1);

    if (!hash) {
        return;
    }

    const element = document.getElementById(hash);

    if (!element) {
        return;
    }

    let node = element?.parentElement;
    while (node) {
        if (isDetailsTag(node)) {
            node.open = true;
        }
        node = node.parentElement;
    }

    element.focus();

    setTimeout(() => {
        scrollToElement(element);
    }, 10);
}

export function getNeuroExpertSettings(
    lang: string,
    neuroExpert: NeuroExpert,
    isInternal: boolean,
): NeuroExpertSettings | undefined {
    const projectId =
        neuroExpert?.projectId?.[lang] ?? neuroExpert?.projectId?.default ?? undefined;

    if (!projectId || projectId === 'none') {
        return undefined;
    }

    const settings = {
        projectId,
        hasOutsideClick: neuroExpert.hasOutsideClick ?? true,
        isInternal,
        parentId: neuroExpert.parentId ?? null,
    };

    return settings;
}

export function renderNEWidget(
    lang: `${Lang}` | Lang,
    neuroExpert?: NeuroExpert,
    isInternal = false,
) {
    if (!neuroExpert || neuroExpert.disabled) {
        return;
    }

    const neScriptUrl =
        'https://yastatic.net/s3/distribution/stardust/neuroexpert-widget/production/neuroexpert-widget.js';
    const settings = getNeuroExpertSettings(lang, neuroExpert, isInternal);

    if (!settings) {
        return;
    }

    const script = document.createElement('script');
    script.type = 'module';
    script.src = neScriptUrl;

    script.onload = () => {
        if (typeof window['initNeuroexpert'] === 'function') {
            window['initNeuroexpert'](settings);
        }
    };

    document.body.appendChild(script);
}
