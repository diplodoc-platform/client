import {Block, ConstructorBlock, Lang} from '@gravity-ui/page-constructor';
import {config, contentTransformer} from '@gravity-ui/page-constructor/server';

export interface MetaData {
    title: string;
    description?: string;
}

export interface PageContentBase {
    meta?: MetaData;
}

export type PageContent<T> = T & PageContentBase;
export type ConstructorPageContent = PageContent<ConstructorPageContentBase>;
export type NavigationData = PageContent<ConstructorNavigaitonData>;
export type ConfigData = ConstructorPageContent | NavigationData;

export interface PreloadParams {
    locale: string;
    pageName: string;
    pageReferer?: string;
}

export function isPageConfig(config: ConfigData): config is ConstructorPageContent {
    return 'blocks' in config;
}

export function preprocess(content: ConfigData, params: PreloadParams, customYfmTransformer) {
    const {lang} = params;

    if (isPageConfig(content) && content.blocks) {
        return {
            ...content,
            blocks: transformBlocks(content.blocks, lang, customYfmTransformer),
        };
    }

    return content;
}

function replaceTransformer(config: BlocksConfig, newTransformer: Function): BlocksConfig {
    return Object.keys(config).reduce((newConfig, key) => {
        const subBlockType = key as SubBlockType;
        newConfig[subBlockType] = config[subBlockType].map((block) => {
            return block.transformer.name === 'yfmTransformer'
                ? {...block, transformer: newTransformer}
                : block;
        });
        return newConfig;
    }, {} as BlocksConfig);
}

function transformBlocks(blocks: ConstructorBlock[], lang: Lang, customYfmTransformer) {
    const customConfig = replaceTransformer(config, customYfmTransformer);

    return contentTransformer({
        content: {blocks},
        options: {
            lang,
            customConfig,
        },
    }).blocks as Block[];
}
