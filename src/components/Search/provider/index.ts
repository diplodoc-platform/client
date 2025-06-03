import type {ISearchProvider, ISearchResult} from '@diplodoc/components';
import type {SearchConfig, WorkerConfig} from '../types';

import {AlgoliaProvider} from './algolia/index';

export class LocalSearchProvider implements ISearchProvider {
    private worker!: Promise<Worker>;

    private config: SearchConfig;

    constructor(config: SearchConfig) {
        this.config = config;
    }

    init = () => {
        this.worker = initWorker({
            ...this.config,
            base: this.base,
            mark: 'Suggest__Item__Marker',
        });
    };

    async suggest(query: string) {
        return this.request({
            type: 'suggest',
            query,
        }) as Promise<ISearchResult[]>;
    }

    async search(query: string) {
        return this.request({
            type: 'search',
            query,
        }) as Promise<ISearchResult[]>;
    }

    // Temporary disable link to search page
    // TODO: Implement search page
    link = () => null;

    // link = (query: string) => {
    //     const params = query ? `?query=${encodeURIComponent(query)}` : '';
    //
    //     return `${this.base}/${this.config.link}${params}`;
    // };

    private get base() {
        return window.location.href.split('/').slice(0, -this.config.depth).join('/');
    }

    private async request(message: object) {
        return request(await this.worker, message);
    }
}

const BAD_ORIGIN_ERROR = /Script at '(.*?)' cannot be accessed from origin/;

async function loadWorker() {
    try {
        return new Worker(new URL('../worker/index.ts', import.meta.url));
    } catch (error) {
        if (error instanceof DOMException) {
            const match = BAD_ORIGIN_ERROR.exec(error.message);
            if (match) {
                const url = match[1];
                const blob = new Blob([`importScripts('${url}');`], {type: 'text/javascript'});

                return new Worker(URL.createObjectURL(blob));
            }
        }

        throw error;
    }
}

async function initWorker(config: WorkerConfig) {
    const worker = await loadWorker();

    await request(worker, {...config, type: 'init'});

    return worker;
}

function request(worker: Worker, message: object) {
    const channel = new MessageChannel();

    return new Promise((resolve, reject) => {
        channel.port1.onmessage = (message) => {
            if (message.data.error) {
                // eslint-disable-next-line no-console
                console.error(message.data.error);

                reject(message.data.error);
            } else {
                resolve(message.data.result);
            }
        };

        channel.port1.onmessageerror = (message) => {
            reject(message.data.error);
        };

        worker.postMessage(message, [channel.port2]);
    });
}

export function createProvider(config: SearchConfig): ISearchProvider | null {
    if (!config) {
        return null;
    }

    const {provider = 'local'} = config;

    if (provider === 'algolia') {
        return new AlgoliaProvider(config);
    }

    return new LocalSearchProvider(config);
}

export const SearchProvider = LocalSearchProvider;
