import { type ReactNode } from "react";
import type { ThemeOverrides } from "@ara/core";
import type { ColorThemeName } from "@ara/tokens/colors";
import { AraProvider, AraThemeBoundary } from "../../theme/AraProvider.js";

export interface ThemeProviderProps {
  readonly theme?: ThemeOverrides;
  readonly mode?: ColorThemeName;
  readonly asChild?: boolean;
  readonly children: ReactNode;
}

const DEFAULT_MODE: ColorThemeName = "light";

export function ThemeProvider({
  theme,
  mode = DEFAULT_MODE,
  asChild = false,
  children
}: ThemeProviderProps) {
  return (
    <AraProvider theme={theme}>
      <AraThemeBoundary mode={mode} asChild={asChild}>
        {children}
      </AraThemeBoundary>
    </AraProvider>
  );
}

ThemeProvider.displayName = "ThemeProvider";
