export const HEADER_HEIGHT = 64;

export const RTL_LANGS = [
    'ar',
    'arc',
    'ckb',
    'dv',
    'fa',
    'ha',
    'he',
    'khw',
    'ks',
    'ps',
    'sd',
    'ur',
    'uz_AF',
    'yi',
];

export enum TextDirection {
    RTL = 'rtl',
    LTR = 'ltr',
}

export const LINK_KEYS_LEADING_CONFIG = ['href'];
export const LINK_KEYS_PAGE_CONSTRUCTOR_CONFIG = [
    'src',
    'url',
    'href',
    'icon',
    'image',
    'desktop',
    'mobile',
    'tablet',
    'previewImg',
    'image',
    'avatar',
    'logo',
    'light',
    'dark',
];

export const LINK_KEYS = [
    ...new Set([...LINK_KEYS_LEADING_CONFIG, ...LINK_KEYS_PAGE_CONSTRUCTOR_CONFIG]),
];
