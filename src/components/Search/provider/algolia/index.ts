import type {ISearchProvider, ISearchResult} from '@diplodoc/components';
import type {SearchConfig, SearchProviderExtended, WorkerConfig} from '../../types';

export class AlgoliaProvider implements ISearchProvider, SearchProviderExtended {
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
        if (!query || query.trim() === '') {
            return [];
        }

        const message = {
            type: 'suggest',
            query,
        };
        return (await this.request(message)) as ISearchResult[];
    }

    async search(query: string, page = 1, count = 10) {
        if (!query || query.trim() === '') {
            return [];
        }

        const message = {
            type: 'search',
            query,
            page,
            count,
        };
        return (await this.request(message)) as ISearchResult[];
    }

    link = (query: string, page = 1) => {
        const searchParams = new URLSearchParams();

        if (query) {
            searchParams.set('query', query);
        }

        if (page > 1) {
            searchParams.set('page', page.toString());
        }

        const params = searchParams.toString() ? `?${searchParams.toString()}` : '';
        const link = `${this.base}/${this.config.link}${params}`;

        return link;
    };

    private get base() {
        const base = window.location.href.split('/').slice(0, -this.config.depth).join('/');

        return base;
    }

    private async request(message: object) {
        const worker = await this.worker;
        return await request(worker, message);
    }
}

const BAD_ORIGIN_ERROR = /Script at '(.*?)' cannot be accessed from origin/;

async function loadWorker() {
    try {
        return new Worker(new URL('../../worker/index.ts', import.meta.url));
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
        channel.port1.onmessage = (event) => {
            if (event.data.error) {
                reject(event.data.error);
            } else {
                resolve(event.data.result);
            }
        };

        channel.port1.onmessageerror = (event) => {
            reject(event);
        };

        worker.postMessage(message, [channel.port2]);
    });
}
