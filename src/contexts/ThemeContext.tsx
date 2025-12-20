import React, { createContext, useContext } from "react";
import { useTheme } from "../hooks/useTheme";

interface ThemeContextType {
  theme: ReturnType<typeof useTheme>[0];
  actions: ReturnType<typeof useTheme>[1];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, actions] = useTheme();

  return (
    <ThemeContext.Provider value={{ theme, actions }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useThemeContext must be used within a ThemeProvider");
  }
  return context;
};
