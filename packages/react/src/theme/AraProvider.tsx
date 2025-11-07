import { Slot } from "@radix-ui/react-slot";
import {
  createContext,
  type ReactNode,
  useContext,
  useMemo
} from "react";
import { createTheme, defaultTheme, type Theme, type ThemeOverrides } from "@ara/core";
import type { CSSProperties } from "react";

type ThemeCSSVariables = CSSProperties & Record<`--${string}`, string>;

const ThemeContext = createContext<Theme>(defaultTheme);

export interface AraProviderProps {
  readonly theme?: ThemeOverrides;
  readonly asChild?: boolean;
  readonly children: ReactNode;
}

function createThemeVariables(theme: Theme): ThemeCSSVariables {
  const variables: ThemeCSSVariables = {} as ThemeCSSVariables;

  for (const [rampName, ramp] of Object.entries(theme.color)) {
    for (const [shade, value] of Object.entries(ramp)) {
      variables[`--ara-color-${rampName}-${shade}`] = value;
    }
  }

  for (const [familyName, value] of Object.entries(theme.typography.fontFamily)) {
    variables[`--ara-font-family-${familyName}`] = value;
  }

  for (const [sizeName, value] of Object.entries(theme.typography.fontSize)) {
    variables[`--ara-font-size-${sizeName}`] = value;
  }

  for (const [weightName, value] of Object.entries(theme.typography.fontWeight)) {
    variables[`--ara-font-weight-${weightName}`] = String(value);
  }

  for (const [spacingName, value] of Object.entries(theme.typography.letterSpacing)) {
    variables[`--ara-letter-spacing-${spacingName}`] = value;
  }

  for (const [lineHeightName, value] of Object.entries(theme.typography.lineHeight)) {
    variables[`--ara-line-height-${lineHeightName}`] = value;
  }

  const button = theme.component.button;

  variables["--ara-btn-radius"] = button.radius;
  variables["--ara-btn-border-width"] = button.borderWidth;
  variables["--ara-btn-font"] = button.font.family;
  variables["--ara-btn-font-weight"] = String(button.font.weight);
  variables["--ara-btn-disabled-opacity"] = String(button.disabled.opacity);
  variables["--ara-btn-focus-outline"] = `${button.focus.outlineWidth} solid ${button.focus.outlineColor}`;
  variables["--ara-btn-focus-outline-offset"] = button.focus.outlineOffset;
  variables["--ara-btn-focus-ring"] = `0 0 0 ${button.focus.ringSize} ${button.focus.ringColor}`;

  for (const [variantName, tones] of Object.entries(button.variant)) {
    for (const [toneName, token] of Object.entries(tones)) {
      const prefix = `--ara-btn-variant-${variantName}-${toneName}`;
      variables[`${prefix}-bg`] = token.background;
      variables[`${prefix}-fg`] = token.foreground;
      variables[`${prefix}-border`] = token.border;
      variables[`${prefix}-bg-hover`] = token.backgroundHover;
      variables[`${prefix}-fg-hover`] = token.foregroundHover;
      variables[`${prefix}-border-hover`] = token.borderHover;
      variables[`${prefix}-bg-active`] = token.backgroundActive;
      variables[`${prefix}-fg-active`] = token.foregroundActive;
      variables[`${prefix}-border-active`] = token.borderActive;
      variables[`${prefix}-shadow`] = token.shadow ?? "none";
    }
  }

  for (const [sizeName, token] of Object.entries(button.size)) {
    const prefix = `--ara-btn-size-${sizeName}`;
    variables[`${prefix}-gap`] = token.gap;
    variables[`${prefix}-px`] = token.paddingInline;
    variables[`${prefix}-py`] = token.paddingBlock;
    variables[`${prefix}-font-size`] = token.fontSize;
    variables[`${prefix}-line-height`] = token.lineHeight;
    variables[`${prefix}-min-height`] = token.minHeight;
    variables[`${prefix}-spinner`] = token.spinnerSize;
  }

  return variables;
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
  readonly children: ReactNode;
}

export function useAraThemeVariables(): ThemeCSSVariables {
  const theme = useAraTheme();
  return useMemo(() => createThemeVariables(theme), [theme]);
}

export function AraThemeBoundary({ asChild = false, children }: AraThemeBoundaryProps) {
  const style = useAraThemeVariables();
  const Container = asChild ? Slot : "div";

  return (
    <Container data-ara-theme="" style={style}>
      {children}
    </Container>
  );
}

export { ThemeContext };
