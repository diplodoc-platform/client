import {useState} from 'react';
import {TextSizes, Theme} from '@diplodoc/components';

import {strToBoolean} from '../utils';

const DEFAULT_USER_SETTINGS = {
    theme: Theme.Light,
    textSize: TextSizes.M,
    showMiniToc: true,
    wideFormat: true,
    fullScreen: false,
};

export function useSettings() {
    const settings = getSettings();

    const [wideFormat, setWideFormat] = useState(settings.wideFormat);
    const [fullScreen, setFullScreen] = useState(settings.fullScreen);
    const [showMiniToc, setShowMiniToc] = useState(settings.showMiniToc);
    const [theme, setTheme] = useState(settings.theme);
    const [textSize, setTextSize] = useState(settings.textSize);

    return {
        theme,
        onChangeTheme: withSavingSetting('theme', setTheme),
        textSize,
        onChangeTextSize: withSavingSetting('textSize', setTextSize),
        wideFormat,
        onChangeWideFormat: withSavingSetting('wideFormat', setWideFormat),
        showMiniToc,
        onChangeShowMiniToc: withSavingSetting('showMiniToc', setShowMiniToc),
        fullScreen,
        onChangeFullScreen: withSavingSetting('fullScreen', setFullScreen),
    };
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
        showMiniToc: strToBoolean(showMiniToc),
        wideFormat: strToBoolean(wideFormat),
        fullScreen: strToBoolean(fullScreen),
    };
}

type TSettings = typeof DEFAULT_USER_SETTINGS;

function getSetting<T extends keyof TSettings>(name: T): TSettings[T] {
    if (typeof sessionStorage === 'undefined') {
        return DEFAULT_USER_SETTINGS[name];
    }

    try {
        return (sessionStorage.getItem(name) as TSettings[T]) || DEFAULT_USER_SETTINGS[name];
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
