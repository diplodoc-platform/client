/// <reference no-default-lib="true"/>
/// <reference lib="ES2019" />
/// <reference lib="webworker" />

/* eslint-disable new-cap */
/* eslint-env worker */

import type {
    InitMessage,
    MessageType,
    SearchMessage,
    SearchResultItem,
    SuggestMessage,
    WorkerApi,
    WorkerConfig,
} from '../../types';

// Default type of `self` is `WorkerGlobalScope & typeof globalThis`
// https://github.com/microsoft/TypeScript/issues/14877
declare const self: ServiceWorkerGlobalScope & {
    config?: WorkerConfig;
    api?: WorkerApi;
};

// Конфигурация по умолчанию
const DEFAULT_CONFIG = {
    tolerance: 3,
    confidence: 0.5,
    mark: 'search-highlight',
    base: '',
};

// Количество слов для обрезки результатов
const TRIM_WORDS = 10;

// Ошибки
const UNKNOWN_HANDLER = {
    message: 'Unknown message type!',
    code: 'UNKNOWN_HANDLER',
};
const NOT_INITIALIZED_CONFIG = {
    message: 'Worker is not initialized with required config!',
    code: 'NOT_INITIALIZED',
};
const NOT_INITIALIZED_API = {
    message: 'Worker is not initialized with required api!',
    code: 'NOT_INITIALIZED',
};

// Интерфейсы для результатов Algolia
interface AlgoliaResult {
    hits?: Array<AlgoliaHit>;
}

interface AlgoliaHit {
    url: string;
    title: string;
    section?: string;
    anchor?: string;
    _highlightResult?: {
        title?: {
            value: string;
        };
        content?: {
            value: string;
        };
    };
    _snippetResult?: {
        content?: {
            value: string;
        };
    };
}

// Проверка конфигурации
export function AssertConfig(config: unknown): asserts config is WorkerConfig {
    if (!config) {
        throw NOT_INITIALIZED_CONFIG;
    }
}

export function AssertApi(api: unknown): asserts api is WorkerApi {
    if (!api) {
        throw NOT_INITIALIZED_API;
    }
}

// API воркера
self.api = {
    // Инициализация воркера
    async init() {
        self.config = {
            ...DEFAULT_CONFIG,
            ...self.config,
        };
    },

    async suggest(query: string, count = 10) {
        AssertConfig(self.config);
        const results = await search(self.config, query, count);
        const formattedResults = format(self.config, results);

        return formattedResults;
    },

    async search(query: string, count = 10, page = 1) {
        AssertConfig(self.config);
        const result = await search(self.config, query, count, page);
        const formattedResults = format(self.config, result);

        return formattedResults;
    },
};

// Функция поиска
async function search(config: WorkerConfig, query: string, count = 10, page = 1) {
    const {appId, searchKey, indexName, querySettings} = config;

    if (!appId || !searchKey || !indexName) {
        throw new Error(
            'Algolia configuration is incomplete. Missing appId, searchKey or indexName.',
        );
    }

    const url = `https://${appId}.algolia.net/1/indexes/${indexName}/query`;

    const requestBody = {
        ...querySettings,
        query,
        hitsPerPage: count,
        page: page - 1,
        attributesToSnippet: [`content:${TRIM_WORDS}`],
        highlightPreTag: `<span class="${config.mark}">`,
        highlightPostTag: `</span>`,
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'x-algolia-application-id': appId,
            'x-algolia-api-key': searchKey,
        },
        body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    return data;
}

function format(config: WorkerConfig, result: AlgoliaResult): SearchResultItem[] {
    const {base} = config;

    if (!result.hits) {
        return [];
    }

    return result.hits.map(
        ({url, title, section, anchor, _highlightResult, _snippetResult}: AlgoliaHit) => {
            const link = anchor
                ? `${base.replace(/\/?$/, '')}/${url}#${anchor}`
                : `${base.replace(/\/?$/, '')}/${url}`;

            const highlightedContent = _highlightResult?.content?.value;
            const description =
                _snippetResult?.content?.value ||
                (highlightedContent ? trim(highlightedContent, TRIM_WORDS) : '');

            return {
                type: 'page',
                link,
                title: _highlightResult?.title?.value || title,
                section,
                description,
            };
        },
    );
}

function trim(text: string, words: number) {
    if (!text) return '';

    const parts = text.split(/\s/);

    if (parts.length > words) {
        return parts.slice(0, words).join(' ') + '...';
    } else {
        return parts.join(' ');
    }
}

const HANDLERS = {
    async init(config: InitMessage) {
        self.config = config;
        if (self.api && self.api.init) {
            return self.api.init();
        }
        return;
    },

    async suggest({query, count = 10}: SuggestMessage) {
        AssertConfig(self.config);
        AssertApi(self.api);
        return self.api.suggest(query, count);
    },

    async search({query, count = 10, page = 1}: SearchMessage) {
        AssertConfig(self.config);
        AssertApi(self.api);
        return self.api.search(query, count, page);
    },
} as const;

self.onmessage = async (message) => {
    const [port] = message.ports;
    const {type} = message.data;

    const handler = HANDLERS[type as MessageType];
    if (!handler) {
        port.postMessage({error: UNKNOWN_HANDLER});
        return;
    }

    try {
        const result = await handler(message.data);
        port.postMessage({result});
    } catch (error) {
        port.postMessage({error});
    }
};
