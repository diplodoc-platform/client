import type {YandexMetrikaInitParams} from '@diplodoc/components';

export interface AnalyticsGtmConfig {
    id: string;
    mode: 'base' | 'notification';
}

export interface AnalyticsMetrikaConfig {
    id: number;
    params: YandexMetrikaInitParams;
}

export interface UserAnalyticsConfig {
    gtm?: Partial<AnalyticsGtmConfig>;
    metrika?: Partial<AnalyticsMetrikaConfig>[];
}

export interface AnalyticsConfig {
    gtm?: AnalyticsGtmConfig;
    metrika: AnalyticsMetrikaConfig[];
}
