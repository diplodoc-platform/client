import type { Meta, StoryObj } from '@storybook/react';
import {Theme, Lang} from '@doc-tools/components';

import { App } from '../App';
import data from './data.json'

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
    title: 'Example/App',
    component: App,
} satisfies Meta<typeof App>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Primary: Story = {
    args: {
        data: data,
        router: {},
        lang: Lang.En,
        settings: {
            theme: Theme.Dark
        }
    },
};
