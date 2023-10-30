import { getDocSettings, withSavingSetting } from '../utils';
import { useState } from 'react';

import {
    TextSizes,
    Theme,
} from '@diplodoc/components';

export function useSettings() {
    const settings = getDocSettings();

    const [wideFormat, setWideFormat] = useState<boolean>(settings.wideFormat);
    const [fullScreen, setFullScreen] = useState<boolean>(settings.fullScreen);
    const [showMiniToc, setShowMiniToc] = useState(settings.showMiniToc);
    const [theme, setTheme] = useState(settings.theme);
    const [textSize, setTextSize] = useState(settings.textSize);

    return {
        theme,
        onChangeTheme: withSavingSetting<Theme>('theme', setTheme),
        textSize,
        onChangeTextSize: withSavingSetting<TextSizes>('textSize', setTextSize),
        wideFormat,
        onChangeWideFormat: withSavingSetting<boolean>('wideFormat', setWideFormat),
        showMiniToc,
        onChangeShowMiniToc: withSavingSetting<boolean>('showMiniToc', setShowMiniToc),
        fullScreen,
        onChangeFullScreen: withSavingSetting<boolean>('fullScreen', setFullScreen),
    };
}
