import { createContext, type ReactNode, useContext, useMemo } from "react";
import { createTheme, defaultTheme, type Theme, type ThemeOverrides } from "@ara/core";

const ThemeContext = createContext<Theme>(defaultTheme);

export interface AraProviderProps {
  readonly theme?: ThemeOverrides;
  readonly children: ReactNode;
}

export function AraProvider({ theme, children }: AraProviderProps) {
  const value = useMemo(() => {
    if (!theme) {
      return defaultTheme;
    }

    return createTheme(theme);
  }, [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

AraProvider.displayName = "AraProvider";

export function useAraTheme(): Theme {
  return useContext(ThemeContext);
}

export { ThemeContext };
