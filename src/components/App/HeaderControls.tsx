import React, {memo} from 'react';

import {Controls, ControlsLayout, ControlSizes, Theme, TextSizes} from '@diplodoc/components';

type OnChangeCallback = (value: any) => void;

type Props = {
    mobileView: boolean;

    theme: Theme;
    onChangeTheme: OnChangeCallback;
    textSize: TextSizes;
    onChangeTextSize: OnChangeCallback;
    wideFormat: boolean;
    onChangeWideFormat: OnChangeCallback;
    showMiniToc: boolean;
    onChangeShowMiniToc: OnChangeCallback;
};

export const HeaderControls = memo<Props>(({
    mobileView,

    theme,
    onChangeTheme,

    textSize,
    onChangeTextSize,

    wideFormat,
    onChangeWideFormat,

    showMiniToc,
    onChangeShowMiniToc,
}) => {
    return (
        <ControlsLayout
            controlClassName={'Control'}
            controlSize={ControlSizes.L}
            isWideView={mobileView}
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
            />
        </ControlsLayout>
    );
});
