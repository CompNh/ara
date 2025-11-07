import { Slot } from "@radix-ui/react-slot";
import {
  createContext,
  type ReactNode,
  useContext,
  useMemo
} from "react";
import { createTheme, defaultTheme, type Theme, type ThemeOverrides } from "@ara/core";
import type { CSSProperties } from "react";

type ThemeCSSVariableName = `--${string}`;
type ThemeCSSVariables = CSSProperties & Record<ThemeCSSVariableName, string>;

function assignVariable(
  variables: ThemeCSSVariables,
  name: ThemeCSSVariableName,
  value: string
) {
  variables[name] = value;
}

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
      assignVariable(
        variables,
        `--ara-color-${rampName}-${shade}` as ThemeCSSVariableName,
        value
      );
    }
  }

  for (const [familyName, value] of Object.entries(theme.typography.fontFamily)) {
    assignVariable(
      variables,
      `--ara-font-family-${familyName}` as ThemeCSSVariableName,
      value
    );
  }

  for (const [sizeName, value] of Object.entries(theme.typography.fontSize)) {
    assignVariable(
      variables,
      `--ara-font-size-${sizeName}` as ThemeCSSVariableName,
      value
    );
  }

  for (const [weightName, value] of Object.entries(theme.typography.fontWeight)) {
    assignVariable(
      variables,
      `--ara-font-weight-${weightName}` as ThemeCSSVariableName,
      String(value)
    );
  }

  for (const [spacingName, value] of Object.entries(theme.typography.letterSpacing)) {
    assignVariable(
      variables,
      `--ara-letter-spacing-${spacingName}` as ThemeCSSVariableName,
      value
    );
  }

  for (const [lineHeightName, value] of Object.entries(theme.typography.lineHeight)) {
    assignVariable(
      variables,
      `--ara-line-height-${lineHeightName}` as ThemeCSSVariableName,
      value
    );
  }

  const button = theme.component.button;

  assignVariable(variables, "--ara-btn-radius", button.radius);
  assignVariable(variables, "--ara-btn-border-width", button.borderWidth);
  assignVariable(variables, "--ara-btn-font", button.font.family);
  assignVariable(
    variables,
    "--ara-btn-font-weight",
    String(button.font.weight)
  );
  assignVariable(
    variables,
    "--ara-btn-disabled-opacity",
    String(button.disabled.opacity)
  );
  assignVariable(
    variables,
    "--ara-btn-focus-outline",
    `${button.focus.outlineWidth} solid ${button.focus.outlineColor}`
  );
  assignVariable(
    variables,
    "--ara-btn-focus-outline-offset",
    button.focus.outlineOffset
  );
  assignVariable(
    variables,
    "--ara-btn-focus-ring",
    `0 0 0 ${button.focus.ringSize} ${button.focus.ringColor}`
  );

  for (const [variantName, tones] of Object.entries(button.variant)) {
    for (const [toneName, token] of Object.entries(tones)) {
      const prefix = `--ara-btn-variant-${variantName}-${toneName}`;
      assignVariable(
        variables,
        `${prefix}-bg` as ThemeCSSVariableName,
        token.background
      );
      assignVariable(
        variables,
        `${prefix}-fg` as ThemeCSSVariableName,
        token.foreground
      );
      assignVariable(
        variables,
        `${prefix}-border` as ThemeCSSVariableName,
        token.border
      );
      assignVariable(
        variables,
        `${prefix}-bg-hover` as ThemeCSSVariableName,
        token.backgroundHover
      );
      assignVariable(
        variables,
        `${prefix}-fg-hover` as ThemeCSSVariableName,
        token.foregroundHover
      );
      assignVariable(
        variables,
        `${prefix}-border-hover` as ThemeCSSVariableName,
        token.borderHover
      );
      assignVariable(
        variables,
        `${prefix}-bg-active` as ThemeCSSVariableName,
        token.backgroundActive
      );
      assignVariable(
        variables,
        `${prefix}-fg-active` as ThemeCSSVariableName,
        token.foregroundActive
      );
      assignVariable(
        variables,
        `${prefix}-border-active` as ThemeCSSVariableName,
        token.borderActive
      );
      assignVariable(
        variables,
        `${prefix}-shadow` as ThemeCSSVariableName,
        token.shadow ?? "none"
      );
    }
  }

  for (const [sizeName, token] of Object.entries(button.size)) {
    const prefix = `--ara-btn-size-${sizeName}`;
    assignVariable(
      variables,
      `${prefix}-gap` as ThemeCSSVariableName,
      token.gap
    );
    assignVariable(
      variables,
      `${prefix}-px` as ThemeCSSVariableName,
      token.paddingInline
    );
    assignVariable(
      variables,
      `${prefix}-py` as ThemeCSSVariableName,
      token.paddingBlock
    );
    assignVariable(
      variables,
      `${prefix}-font-size` as ThemeCSSVariableName,
      token.fontSize
    );
    assignVariable(
      variables,
      `${prefix}-line-height` as ThemeCSSVariableName,
      token.lineHeight
    );
    assignVariable(
      variables,
      `${prefix}-min-height` as ThemeCSSVariableName,
      token.minHeight
    );
    assignVariable(
      variables,
      `${prefix}-spinner` as ThemeCSSVariableName,
      token.spinnerSize
    );
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
