import { Slot } from "@radix-ui/react-slot";
import {
  createContext,
  type CSSProperties,
  type ReactNode,
  useContext,
  useMemo
} from "react";
import { createTheme, defaultTheme, type Theme, type ThemeOverrides } from "@ara/core";
import type { ColorThemeName } from "@ara/tokens/colors";
import {
  createCSSVariableTable,
  mergeCSSVariableMaps,
  type CSSVariableMap,
  type ThemeCSSVariableTable
} from "@ara/tokens/css-vars";

const ThemeContext = createContext<Theme>(defaultTheme);
const DEFAULT_COLOR_THEME: ColorThemeName = "light";

export type TextDirection = "ltr" | "rtl" | "auto";

function resolveThemeVariables(
  table: ThemeCSSVariableTable,
  mode: ColorThemeName
): CSSVariableMap {
  const themeVariables =
    table.themes[mode] ??
    table.themes[DEFAULT_COLOR_THEME] ??
    Object.values(table.themes)[0];

  if (!themeVariables) {
    return mergeCSSVariableMaps(table.root);
  }

  return mergeCSSVariableMaps(table.root, themeVariables);
}

export interface AraProviderProps {
  readonly theme?: ThemeOverrides;
  readonly asChild?: boolean;
  readonly children: ReactNode;
}

export function AraProvider({ theme, asChild = false, children }: AraProviderProps) {
  const value = useMemo(() => {
    if (!theme) {
      return defaultTheme;
    }

    return createTheme(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={value}>
      {asChild ? <Slot>{children}</Slot> : children}
    </ThemeContext.Provider>
  );
}

AraProvider.displayName = "AraProvider";

export function useAraTheme(): Theme {
  return useContext(ThemeContext);
}

export interface AraThemeBoundaryProps {
  readonly asChild?: boolean;
  readonly mode?: ColorThemeName;
  readonly direction?: TextDirection;
  readonly children: ReactNode;
}

export function useAraThemeVariableTable(): ThemeCSSVariableTable {
  const theme = useAraTheme();
  return useMemo(() => createCSSVariableTable(theme), [theme]);
}

export function useAraThemeVariables(
  mode: ColorThemeName = DEFAULT_COLOR_THEME
): CSSVariableMap {
  const table = useAraThemeVariableTable();
  return useMemo(() => resolveThemeVariables(table, mode), [table, mode]);
}

export function AraThemeBoundary({
  asChild = false,
  mode = DEFAULT_COLOR_THEME,
  direction,
  children
}: AraThemeBoundaryProps) {
  const style = useAraThemeVariables(mode);
  const cssStyle = useMemo<CSSProperties>(
    () => ({
      ...style,
      colorScheme: mode
    }),
    [mode, style]
  );
  const Container = asChild ? Slot : "div";

  return (
    <Container data-ara-theme={mode} dir={direction ?? undefined} style={cssStyle}>
      {children}
    </Container>
  );
}

export { ThemeContext };
