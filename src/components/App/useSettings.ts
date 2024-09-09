import {useMemo, useState} from 'react';
import {TextSizes, Theme} from '@diplodoc/components';

const DEFAULT_USER_SETTINGS = {
    theme: Theme.Light,
    textSize: TextSizes.M,
    showMiniToc: true,
    wideFormat: true,
    fullScreen: false,
};

const capitalize = <T extends string>(string: T): Capitalize<T> =>
    string.replace(/^./, (ch) => ch.toUpperCase()) as Capitalize<T>;

const toBoolean = (str: string | boolean) => {
    if (typeof str === 'boolean') {
        return str;
    }

    return str ? str === 'true' : false;
};

export type Settings = typeof DEFAULT_USER_SETTINGS;

export function useSettings() {
    const settings = getSettings();

    const theme = useSetting('theme', settings);
    const textSize = useSetting('textSize', settings);
    const wideFormat = useSetting('wideFormat', settings);
    const fullScreen = useSetting('fullScreen', settings);
    const showMiniToc = useSetting('showMiniToc', settings);

    const controls = useMemo(
        () => ({
            ...theme,
            ...textSize,
            ...wideFormat,
            ...showMiniToc,
            ...fullScreen,
        }),
        [theme, textSize, wideFormat, showMiniToc, fullScreen],
    );

    return controls;
}

function getSettings() {
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

type State<P extends keyof Settings> = {
    [prop in P]: Settings[P];
} & {
    [prop in `onChange${Capitalize<P>}`]: (value: Settings[P]) => void;
};

function useSetting<P extends keyof Settings>(name: P, settings: Settings): State<P> {
    const [setting, setSetting] = useState<Settings[P]>(settings[name]);
    const onChangeSetting = useMemo(() => withSavingSetting(name, setSetting), [name, setSetting]);

    return useMemo(
        () =>
            ({
                [name]: setting,
                ['onChange' + capitalize(name)]: onChangeSetting,
            }) as State<P>,
        [name, setting, onChangeSetting],
    );
}

function getSetting<T extends keyof Settings>(name: T): Settings[T] {
    if (typeof sessionStorage === 'undefined') {
        return DEFAULT_USER_SETTINGS[name];
    }

    try {
        return (sessionStorage.getItem(name) as Settings[T]) || DEFAULT_USER_SETTINGS[name];
    } catch {
        return DEFAULT_USER_SETTINGS[name];
    }
}

function setSetting<T>(name: string, value: T) {
    try {
        sessionStorage.setItem(name, String(value));
    } catch {}
}

function withSavingSetting<T>(settingName: string, onChange: (value: T) => void) {
    return (value: T) => {
        setSetting<T>(settingName, value);

        onChange(value);
    };
}
