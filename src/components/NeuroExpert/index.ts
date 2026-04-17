import {createContext, useContext} from 'react';

export interface NeuroExpertConfig {
    projectId?: string;
}

export const NeuroExpertContext = createContext<NeuroExpertConfig | null | undefined>(null);

NeuroExpertContext.displayName = 'NeuroExpertContext';

export const NeuroExpertProvider = NeuroExpertContext.Provider;

export function useNeuroExpert() {
    return useContext(NeuroExpertContext);
}
