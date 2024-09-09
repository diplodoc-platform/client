import {Lang, Theme} from '@diplodoc/components';

import {RTL_LANGS, TextDirection} from './constants';

export function updateThemeClassName(theme: Theme) {
    document.querySelectorAll('.g-root').forEach((el) => {
        el.classList.toggle('g-root_theme_light', theme === 'light');
        el.classList.toggle('g-root_theme_dark', theme === 'dark');
    });
}

export function updateRootClassName(states: {
    mobileView?: boolean;
    wideFormat?: boolean;
    focusSearch?: boolean;
}) {
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
