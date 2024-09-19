import type {ISearchProvider, ISearchResult} from '@diplodoc/components';
import type {SearchConfig, WorkerConfig} from '../types';

export class SearchProvider implements ISearchProvider {
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
        return window.location.pathname
            .split('/')
            .slice(0, -(this.config.depth + 1))
            .join('/');
    }

    private async request(message: object) {
        return request(await this.worker, message);
    }
}

async function initWorker(config: WorkerConfig) {
    const worker = new Worker(new URL('../worker/index.ts', import.meta.url));

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
