/// <reference no-default-lib="true"/>
/// <reference lib="ES2015" />
/// <reference lib="webworker" />

/* eslint-disable new-cap */
import type {
    InitMessage,
    MessageType,
    SearchMessage,
    SuggestMessage,
    WorkerApi,
    WorkerConfig,
} from '../types';

// Default type of `self` is `WorkerGlobalScope & typeof globalThis`
// https://github.com/microsoft/TypeScript/issues/14877
declare const self: ServiceWorkerGlobalScope & {
    config?: WorkerConfig;
    api?: WorkerApi;
};

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

const HANDLERS = {
    async init(config: InitMessage) {
        self.config = config;

        if (config.provider === 'algolia') {
            importScripts(new URL('./algolia/index.ts', import.meta.url).toString());
        } else if (self.config.api) {
            importScripts(self.config.base + '/' + self.config.api);
        }

        AssertApi(self.api);

        if (self.api.init) {
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
    }

    try {
        const result = await handler(message.data);

        port.postMessage({result});
    } catch (error) {
        port.postMessage({error});
    }
};
