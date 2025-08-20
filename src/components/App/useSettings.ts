import type {Settings} from '../../utils';

import {useMemo, useState} from 'react';

import {getSettings, setSetting} from '../../utils';

const capitalize = <T extends string>(string: T): Capitalize<T> =>
    string.replace(/^./, (ch) => ch.toUpperCase()) as Capitalize<T>;

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

type State<P extends keyof Settings> = Record<P, Settings[P]> &
    Record<`onChange${Capitalize<P>}`, (value: Settings[P]) => void>;

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

function withSavingSetting<T>(settingName: string, onChange: (value: T) => void) {
    return (value: T) => {
        setSetting<T>(settingName, value);

        onChange(value);
    };
}
