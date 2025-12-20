import { useState, useEffect, useCallback } from "react";
import { COLOR_PALETTES } from "../../utils/helpers";

export interface ThemeState {
  isDarkMode: boolean;
  appColor: string;
  isBoldTheme: boolean;
}

export interface ThemeActions {
  toggleDarkMode: () => void;
  setAppColor: (color: string) => void;
  toggleBoldTheme: () => void;
  applyTheme: () => void;
}

export const useTheme = (): [ThemeState, ThemeActions] => {
  const [theme, setTheme] = useState<ThemeState>({
    isDarkMode: localStorage.getItem("theme") === "dark",
    appColor: localStorage.getItem("appColor") || "blue",
    isBoldTheme: localStorage.getItem("isBoldTheme") === "true",
  });

  const applyTheme = useCallback(() => {
    const root = document.documentElement;

    // Apply dark mode
    if (theme.isDarkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }

    // Apply app color
    const palette = COLOR_PALETTES[theme.appColor] || COLOR_PALETTES["blue"];
    Object.entries(palette.colors).forEach(([shade, value]) => {
      root.style.setProperty(`--primary-${shade}`, value);
    });
    localStorage.setItem("appColor", theme.appColor);

    // Apply bold theme
    if (theme.isBoldTheme) {
      document.body.classList.add("theme-bold");
      localStorage.setItem("isBoldTheme", "true");
    } else {
      document.body.classList.remove("theme-bold");
      localStorage.setItem("isBoldTheme", "false");
    }
  }, [theme]);

  useEffect(() => {
    applyTheme();
  }, [applyTheme]);

  const toggleDarkMode = useCallback(() => {
    setTheme((prev) => ({
      ...prev,
      isDarkMode: !prev.isDarkMode,
    }));
  }, []);

  const setAppColor = useCallback((color: string) => {
    setTheme((prev) => ({
      ...prev,
      appColor: color,
    }));
  }, []);

  const toggleBoldTheme = useCallback(() => {
    setTheme((prev) => ({
      ...prev,
      isBoldTheme: !prev.isBoldTheme,
    }));
  }, []);

  const actions: ThemeActions = {
    toggleDarkMode,
    setAppColor,
    toggleBoldTheme,
    applyTheme,
  };

  return [theme, actions];
};
