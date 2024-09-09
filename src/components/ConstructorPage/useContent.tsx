import type {ReactNode} from 'react';
import type {PageContent} from '@gravity-ui/page-constructor';
import type {DocContentPageData} from '@diplodoc/components';

import {DocumentType, getPageType} from '@diplodoc/components';
import {useMemo} from 'react';

export const useContent = (data: DocContentPageData, CustomPage: () => ReactNode) => {
    const type = getPageType(data);
    const fullScreen =
        type === DocumentType.PageConstructor &&
        'data' in data &&
        'fullScreen' in data.data &&
        data.data.fullScreen;

    const layout = useMemo(
        () =>
            fullScreen
                ? (data.data as PageContent)
                : {
                      blocks: [
                          {
                              type: 'page',
                              resetPaddings: true,
                          },
                      ],
                  },
        [fullScreen, data],
    );

    const config = useMemo(
        () => ({
            custom: {
                page: CustomPage,
            },
            layout,
        }),
        [CustomPage, layout],
    );

    return config;
};
