import {BreadcrumbItem, Lang} from '@diplodoc/components';

export enum OnlineSearchItemType {
    Documentation = 'doc',
}

export interface OnlineSearchMapItem {
    type: OnlineSearchItemType;
    count: number;
}

export interface OnlineSearchMeta {
    stage?: string;
    date?: Date;
    author?: string;
    address?: string;
    keywords?: string[];
}

export interface OnlineSearchExtra {
    content: string;
}

export interface OnlineSearchHighlights {
    title: string;
    content: string;
    description: string;
}

export interface OnlineSearchItem {
    id: string;
    name: string;
    isStatic: boolean;
    url: string;
    title: string;
    lang: Lang;
    type: OnlineSearchItemType;
    typeUrl: string;
    subType?: string;
    subTypeUrl?: string;
    description?: string;
    icon?: string;
    pagerank: number;
    breadcrumbs?: BreadcrumbItem[];
    highlights?: OnlineSearchHighlights;
    meta?: OnlineSearchMeta;
    extra?: OnlineSearchExtra[];
}

export interface OnlineSearchResult {
    map: OnlineSearchMapItem[];
    hits: OnlineSearchItem[];
    total: number;
    found: boolean;
}
