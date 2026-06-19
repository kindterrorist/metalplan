import React, { createContext, useContext } from 'react';
import { saveAthlete } from '../../services/electronDb';
import { AthleteContextValue } from './types';

const AthleteContext = createContext<AthleteContextValue | null>(null);

export const useAthleteContext = () => {
    const ctx = useContext(AthleteContext);
    if (!ctx) throw new Error('useAthleteContext must be used within AthleteProvider');
    return ctx;
};

export const AthleteProvider: React.FC<{ value: AthleteContextValue; children: React.ReactNode }> = ({ value, children }) => {
    return <AthleteContext.Provider value={value}>{children}</AthleteContext.Provider>;
};
