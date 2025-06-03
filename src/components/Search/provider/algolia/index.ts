import type {ISearchProvider, ISearchResult} from '@diplodoc/components';
import type {SearchConfig, WorkerConfig} from '../../types';

export class AlgoliaProvider implements ISearchProvider {
    private worker!: Promise<Worker>;
    private config: SearchConfig;

    constructor(config: SearchConfig) {
        this.config = config;
    }

    init = () => {
        const workerConfig = {
            ...this.config,
            base: this.base,
            mark: 'Suggest__Item__Marker',
        };

        this.worker = initWorker(workerConfig);
    };

    async suggest(query: string) {
        const message = {
            type: 'suggest',
            query,
        };
        const results = (await this.request(message)) as ISearchResult[];

        return results;
    }

    async search(query: string) {
        const message = {
            type: 'search',
            query,
        };
        const results = (await this.request(message)) as ISearchResult[];

        return results;
    }

    link = (query: string) => {
        const params = query ? `?query=${encodeURIComponent(query)}` : '';
        const link = `${this.base}/${this.config.link}${params}`;

        return link;
    };

    private get base() {
        const base = window.location.href.split('/').slice(0, -this.config.depth).join('/');

        return base;
    }

    private async request(message: object) {
        const worker = await this.worker;
        const result = await request(worker, message);

        return result;
    }
}

const BAD_ORIGIN_ERROR = /Script at '(.*?)' cannot be accessed from origin/;

async function loadWorker() {
    try {
        return new Worker(new URL('../../worker/algolia/index.ts', import.meta.url));
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
