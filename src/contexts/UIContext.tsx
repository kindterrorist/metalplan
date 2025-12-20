import React, { createContext, useContext } from "react";
import { useUIState } from "../hooks/useUIState";

interface UIContextType {
  state: ReturnType<typeof useUIState>[0];
  actions: ReturnType<typeof useUIState>[1];
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, actions] = useUIState();

  return (
    <UIContext.Provider value={{ state, actions }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUIContext = (): UIContextType => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error("useUIContext must be used within a UIProvider");
  }
  return context;
};
