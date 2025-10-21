import type {PageData} from './index';
import type {NeuroExpert} from '@diplodoc/components';

export function useNeuroExpert(data: PageData, baseNeuroExpert?: NeuroExpert) {
    if (!('meta' in data)) {
        return baseNeuroExpert;
    }

    const metaNeuroExpert = data.meta.neuroExpert;

    return {
        ...(baseNeuroExpert ?? {}),
        ...(metaNeuroExpert ?? {}),
    };
}
