import type {
    Block,
    ConstructorBlock,
    NavigationData as ConstructorNavigaitonData,
    PageContent as ConstructorPageContentBase,
} from '@gravity-ui/page-constructor';
import type {BlocksConfig, Parser, TransformerRaw} from '@gravity-ui/page-constructor/server';

import {config, contentTransformer} from '@gravity-ui/page-constructor/server';

export interface MetaData {
    title: string;
    description?: string;
}

export interface PageContentBase {
    meta?: MetaData;
}

export enum Lang {
    RU = 'ru',
    EN = 'en',
}

export type PageContent<T> = T & PageContentBase;
export type ConstructorPageContent = PageContent<ConstructorPageContentBase>;
export type NavigationData = PageContent<ConstructorNavigaitonData>;
export type ConfigData = ConstructorPageContent | NavigationData;

export interface PreloadParams {
    lang: `${Lang}` | Lang;
    pageName: string;
    pageReferer?: string;
}

interface BlockConfig {
    transformer: TransformerRaw;
    fields?: string[];
    parser?: Parser;
}

export function isPageConfig(config: ConfigData): config is ConstructorPageContent {
    return 'blocks' in config;
}

export function preprocess(
    content: ConfigData,
    params: PreloadParams,
    customYfmTransformer: TransformerRaw,
) {
    const {lang} = params;

    if (isPageConfig(content) && content.blocks) {
        return {
            ...content,
            blocks: transformBlocks(content.blocks, lang, customYfmTransformer),
        };
    }

    return content;
}

function replaceTransformer(config: BlocksConfig, newTransformer: TransformerRaw): BlocksConfig {
    return Object.keys(config).reduce((newConfig, subBlockType) => {
        const subBlock = config[subBlockType];

        if (Array.isArray(subBlock)) {
            newConfig[subBlockType] = subBlock.map((block: {transformer: {name: string}}) => {
                return block.transformer.name === 'yfmTransformer'
                    ? {...block, transformer: newTransformer}
                    : block;
            }) as BlockConfig[];
        } else {
            newConfig[subBlockType] =
                subBlock.transformer.name === 'yfmTransformer'
                    ? {...subBlock, transformer: newTransformer}
                    : subBlock;
        }

        return newConfig;
    }, {} as BlocksConfig);
}

function transformBlocks(
    blocks: ConstructorBlock[],
    lang: `${Lang}` | Lang,
    customYfmTransformer: TransformerRaw,
) {
    const customConfig = replaceTransformer(config, customYfmTransformer);

    return contentTransformer({
        content: {blocks},
        options: {
            lang,
            customConfig,
        },
    }).blocks as Block[];
}
