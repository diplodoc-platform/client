import React, {memo} from 'react';
import {ControlSizes, Controls, ControlsLayout, Lang, TextSizes, Theme} from '@diplodoc/components';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OnChangeCallback = (value: any) => void;

export type Props = {
    mobileView: boolean;

    theme: Theme;
    onChangeTheme: OnChangeCallback;
    textSize: TextSizes;
    onChangeTextSize: OnChangeCallback;
    wideFormat: boolean;
    onChangeWideFormat: OnChangeCallback;
    showMiniToc: boolean;
    onChangeShowMiniToc: OnChangeCallback;
    lang: Lang | `${Lang}`;
    langs: (Lang | `${Lang}`)[];
    onChangeLang?: (lang: `${Lang}` | Lang) => void;
};

export const HeaderControls = memo<Props>(
    ({
        mobileView,

        theme,
        onChangeTheme,

        textSize,
        onChangeTextSize,

        wideFormat,
        onChangeWideFormat,

        showMiniToc,
        onChangeShowMiniToc,

        lang,
        langs,
        onChangeLang,
    }) => {
        return (
            <ControlsLayout
                controlClassName={'Control'}
                controlSize={ControlSizes.L}
                isWideView={mobileView}
                isMobileView={mobileView}
            >
                <Controls
                    className={'Controls'}
                    theme={theme}
                    onChangeTheme={onChangeTheme}
                    wideFormat={wideFormat}
                    onChangeWideFormat={onChangeWideFormat}
                    showMiniToc={showMiniToc}
                    onChangeShowMiniToc={onChangeShowMiniToc}
                    textSize={textSize}
                    onChangeTextSize={onChangeTextSize}
                    lang={lang}
                    langs={langs}
                    onChangeLang={onChangeLang}
                />
            </ControlsLayout>
        );
    },
);

HeaderControls.displayName = 'HeaderControls';
