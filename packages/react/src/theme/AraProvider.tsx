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
type ThemeCSSVariableValue = string | number;
type ThemeCSSVariables = CSSProperties & Record<ThemeCSSVariableName, string>;

function assignVariable(
  variables: ThemeCSSVariables,
  name: ThemeCSSVariableName,
  value: ThemeCSSVariableValue
) {
  variables[name] = typeof value === "string" ? value : String(value);
}

function assignColorRampVariables(variables: ThemeCSSVariables, theme: Theme) {
  for (const [rampName, ramp] of Object.entries(theme.color.palette)) {
    for (const [shade, value] of Object.entries(ramp)) {
      assignVariable(
        variables,
        `--ara-color-${rampName}-${shade}` as ThemeCSSVariableName,
        value
      );
    }
  }
}

function assignColorRoleVariables(variables: ThemeCSSVariables, theme: Theme) {
  for (const [themeName, role] of Object.entries(theme.color.role)) {
    for (const [surfaceName, value] of Object.entries(role.surface)) {
      assignVariable(
        variables,
        `--ara-color-role-${themeName}-surface-${surfaceName}` as ThemeCSSVariableName,
        value
      );
    }

    for (const [textName, value] of Object.entries(role.text)) {
      assignVariable(
        variables,
        `--ara-color-role-${themeName}-text-${textName}` as ThemeCSSVariableName,
        value
      );
    }

    for (const [borderName, value] of Object.entries(role.border)) {
      assignVariable(
        variables,
        `--ara-color-role-${themeName}-border-${borderName}` as ThemeCSSVariableName,
        value
      );
    }

    for (const [roleName, states] of Object.entries(role.interactive)) {
      for (const [stateName, tokens] of Object.entries(states)) {
        const prefix = `--ara-color-role-${themeName}-interactive-${roleName}-${stateName}`;
        assignVariable(
          variables,
          `${prefix}-bg` as ThemeCSSVariableName,
          tokens.background
        );
        assignVariable(
          variables,
          `${prefix}-fg` as ThemeCSSVariableName,
          tokens.foreground
        );
        assignVariable(
          variables,
          `${prefix}-border` as ThemeCSSVariableName,
          tokens.border
        );
      }
    }
  }
}

function assignTypographyVariables(variables: ThemeCSSVariables, theme: Theme) {
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
      value
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
}

function assignLayoutVariables(variables: ThemeCSSVariables, theme: Theme) {
  for (const [spaceName, value] of Object.entries(theme.layout.space)) {
    assignVariable(
      variables,
      `--ara-space-${spaceName}` as ThemeCSSVariableName,
      value
    );
  }

  for (const [radiusName, value] of Object.entries(theme.layout.radius)) {
    assignVariable(
      variables,
      `--ara-radius-${radiusName}` as ThemeCSSVariableName,
      value
    );
  }

  for (const [elevationName, value] of Object.entries(theme.layout.elevation)) {
    assignVariable(
      variables,
      `--ara-elevation-${elevationName}` as ThemeCSSVariableName,
      value
    );
  }

  for (const [zIndexName, value] of Object.entries(theme.layout.zIndex)) {
    assignVariable(
      variables,
      `--ara-z-index-${zIndexName}` as ThemeCSSVariableName,
      value
    );
  }
}

function assignButtonVariables(variables: ThemeCSSVariables, theme: Theme) {
  const button = theme.component.button;

  assignVariable(variables, "--ara-btn-radius", button.radius);
  assignVariable(variables, "--ara-btn-border-width", button.borderWidth);
  assignVariable(variables, "--ara-btn-font", button.font.family);
  assignVariable(variables, "--ara-btn-font-weight", button.font.weight);
  assignVariable(variables, "--ara-btn-disabled-opacity", button.disabled.opacity);
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
      assignVariable(variables, `${prefix}-bg` as ThemeCSSVariableName, token.background);
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
    assignVariable(variables, `${prefix}-gap` as ThemeCSSVariableName, token.gap);
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
}

const ThemeContext = createContext<Theme>(defaultTheme);

export interface AraProviderProps {
  readonly theme?: ThemeOverrides;
  readonly asChild?: boolean;
  readonly children: ReactNode;
}

function createThemeVariables(theme: Theme): ThemeCSSVariables {
  const variables: ThemeCSSVariables = {} as ThemeCSSVariables;

  assignColorRampVariables(variables, theme);
  assignColorRoleVariables(variables, theme);
  assignTypographyVariables(variables, theme);
  assignLayoutVariables(variables, theme);
  assignButtonVariables(variables, theme);

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
