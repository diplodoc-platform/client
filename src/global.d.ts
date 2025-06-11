import type {DocInnerProps} from './components/App';
import type {SearchConfig} from './components/Search/types';

declare global {
    interface Window {
        STATIC_CONTENT?: boolean;
        __DATA__: DocInnerProps & {
            search: SearchConfig;
        };
    }
}
