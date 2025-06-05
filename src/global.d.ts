import {DocInnerProps} from './components/App';
import {SearchConfig} from './components/Search/types';

declare global {
    interface Window {
        STATIC_CONTENT?: boolean;
        __DATA__: DocInnerProps | SearchConfig;
    }
}
