import React, { createContext, useContext, useState } from 'react';

interface AppContextType {
  isBusiness: boolean;
  setIsBusiness: (value: boolean) => void;
  currentScreen: string;
  setCurrentScreen: (screen: any) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [isBusiness, setIsBusiness] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'login' | 'register' | 'home'>('welcome');

  return (
    <AppContext.Provider value={{ isBusiness, setIsBusiness, currentScreen, setCurrentScreen }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
