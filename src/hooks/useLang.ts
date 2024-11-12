import {createContext, useContext} from 'react';
import {Lang} from '@diplodoc/components';

const LangContext = createContext<`${Lang}` | Lang>(Lang.En);

LangContext.displayName = 'Lang';

export const LangProvider = LangContext.Provider;

export function useLang() {
    return useContext(LangContext);
}
