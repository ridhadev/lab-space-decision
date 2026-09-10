import React, { createContext, useContext, useEffect } from "react";
import { ThemeTone, ColorMode } from "../types";

interface ThemeContextType {
  themeTone: ThemeTone;
  colorMode: ColorMode;
  setThemeTone: (tone: ThemeTone) => void;
  setColorMode: (mode: ColorMode) => void;
  toggleColorMode: () => void;
  toggleThemeTone: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const themeTone: ThemeTone = "navy";
  const colorMode: ColorMode = "dark";

  const setThemeTone = (_tone: ThemeTone) => {};
  const setColorMode = (_mode: ColorMode) => {};
  const toggleColorMode = () => {};
  const toggleThemeTone = () => {};

  useEffect(() => {
    // Clear any obsolete stored theme/mode
    try {
      localStorage.removeItem("decisionspace_theme");
      localStorage.removeItem("decisionspace_mode");
    } catch {
      // ignore
    }

    const root = document.documentElement;
    root.setAttribute("data-theme", "navy");
    root.setAttribute("data-mode", "dark");
    root.classList.add("dark");
    root.classList.remove("light");
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        themeTone,
        colorMode,
        setThemeTone,
        setColorMode,
        toggleColorMode,
        toggleThemeTone,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

