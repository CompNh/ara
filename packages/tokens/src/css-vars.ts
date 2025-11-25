import type { Tokens } from "./index.js";
import type { ColorThemeName } from "./colors.js";

export type CSSVariableName = `--ara-${string}`;
export type CSSVariableValue = string | number;
export type CSSVariableMap = Record<CSSVariableName, string>;

export interface ThemeCSSVariableTable {
  readonly root: CSSVariableMap;
  readonly themes: Record<ColorThemeName, CSSVariableMap>;
}

function assignVariable(
  variables: CSSVariableMap,
  name: CSSVariableName,
  value: CSSVariableValue
) {
  variables[name] = typeof value === "string" ? value : String(value);
}

function createPaletteVariables(theme: Tokens): CSSVariableMap {
  const variables: CSSVariableMap = {} as CSSVariableMap;

  for (const [rampName, ramp] of Object.entries(theme.color.palette)) {
    for (const [shade, value] of Object.entries(ramp)) {
      assignVariable(
        variables,
        `--ara-color-${rampName}-${shade}` as CSSVariableName,
        value
      );
    }
  }

  return variables;
}

function createTypographyVariables(theme: Tokens): CSSVariableMap {
  const variables: CSSVariableMap = {} as CSSVariableMap;

  for (const [familyName, value] of Object.entries(theme.typography.fontFamily)) {
    assignVariable(
      variables,
      `--ara-font-family-${familyName}` as CSSVariableName,
      value
    );
  }

  for (const [sizeName, value] of Object.entries(theme.typography.fontSize)) {
    assignVariable(
      variables,
      `--ara-font-size-${sizeName}` as CSSVariableName,
      value
    );
  }

  for (const [weightName, value] of Object.entries(theme.typography.fontWeight)) {
    assignVariable(
      variables,
      `--ara-font-weight-${weightName}` as CSSVariableName,
      value
    );
  }

  for (const [spacingName, value] of Object.entries(theme.typography.letterSpacing)) {
    assignVariable(
      variables,
      `--ara-letter-spacing-${spacingName}` as CSSVariableName,
      value
    );
  }

  for (const [lineHeightName, value] of Object.entries(theme.typography.lineHeight)) {
    assignVariable(
      variables,
      `--ara-line-height-${lineHeightName}` as CSSVariableName,
      value
    );
  }

  return variables;
}

function createLayoutVariables(theme: Tokens): CSSVariableMap {
  const variables: CSSVariableMap = {} as CSSVariableMap;

  for (const [spaceName, value] of Object.entries(theme.layout.space)) {
    assignVariable(
      variables,
      `--ara-space-${spaceName}` as CSSVariableName,
      value
    );
  }

  for (const [radiusName, value] of Object.entries(theme.layout.radius)) {
    assignVariable(
      variables,
      `--ara-radius-${radiusName}` as CSSVariableName,
      value
    );
  }

  for (const [elevationName, value] of Object.entries(theme.layout.elevation)) {
    assignVariable(
      variables,
      `--ara-elevation-${elevationName}` as CSSVariableName,
      value
    );
  }

  for (const [zIndexName, value] of Object.entries(theme.layout.zIndex)) {
    assignVariable(
      variables,
      `--ara-z-index-${zIndexName}` as CSSVariableName,
      value
    );
  }

  return variables;
}

function createTextFieldVariables(theme: Tokens): CSSVariableMap {
  const variables: CSSVariableMap = {} as CSSVariableMap;
  const textField = theme.component.textField;

  assignVariable(variables, "--ara-tf-font", textField.font.family);
  assignVariable(variables, "--ara-tf-font-weight", textField.font.weight);
  assignVariable(variables, "--ara-tf-radius", textField.radius);
  assignVariable(variables, "--ara-tf-border-width", textField.borderWidth);
  assignVariable(variables, "--ara-tf-disabled-opacity", textField.disabled.opacity);
  assignVariable(
    variables,
    "--ara-tf-outline" as CSSVariableName,
    `${textField.focus.outlineWidth} solid ${textField.focus.outlineColor}`
  );
  assignVariable(
    variables,
    "--ara-tf-shadow-focus" as CSSVariableName,
    `0 0 0 ${textField.focus.ringSize} ${textField.focus.ringColor}`
  );

  for (const [toneName, toneTokens] of Object.entries(textField.tone)) {
    const tonePrefix = `--ara-tf-tone-${toneName}`;

    for (const [stateName, value] of Object.entries(toneTokens.surface)) {
      assignVariable(
        variables,
        `${tonePrefix}-surface-${stateName}` as CSSVariableName,
        value
      );
    }

    for (const [stateName, value] of Object.entries(toneTokens.border)) {
      assignVariable(
        variables,
        `${tonePrefix}-border-${stateName}` as CSSVariableName,
        value
      );
    }

    for (const [stateName, value] of Object.entries(toneTokens.text)) {
      assignVariable(
        variables,
        `${tonePrefix}-text-${stateName}` as CSSVariableName,
        value
      );
    }
  }

  const defaultTone = textField.tone.neutral;

  assignVariable(variables, "--ara-tf-surface-default" as CSSVariableName, defaultTone.surface.default);
  assignVariable(variables, "--ara-tf-surface-hover" as CSSVariableName, defaultTone.surface.hover);
  assignVariable(variables, "--ara-tf-surface-focus" as CSSVariableName, defaultTone.surface.focus);
  assignVariable(variables, "--ara-tf-surface-disabled" as CSSVariableName, defaultTone.surface.disabled);
  assignVariable(variables, "--ara-tf-surface-invalid" as CSSVariableName, defaultTone.surface.invalid);
  assignVariable(variables, "--ara-tf-border-default" as CSSVariableName, defaultTone.border.default);
  assignVariable(variables, "--ara-tf-border-hover" as CSSVariableName, defaultTone.border.hover);
  assignVariable(variables, "--ara-tf-border-focus" as CSSVariableName, defaultTone.border.focus);
  assignVariable(variables, "--ara-tf-border-disabled" as CSSVariableName, defaultTone.border.disabled);
  assignVariable(variables, "--ara-tf-border-invalid" as CSSVariableName, defaultTone.border.invalid);
  assignVariable(variables, "--ara-tf-text-default" as CSSVariableName, defaultTone.text.default);
  assignVariable(variables, "--ara-tf-text-disabled" as CSSVariableName, defaultTone.text.disabled);
  assignVariable(variables, "--ara-tf-text-invalid" as CSSVariableName, defaultTone.text.invalid);

  for (const [sizeName, sizeTokens] of Object.entries(textField.size)) {
    const sizePrefix = `--ara-tf-size-${sizeName}`;

    assignVariable(variables, `${sizePrefix}-height` as CSSVariableName, sizeTokens.height);
    assignVariable(variables, `${sizePrefix}-px` as CSSVariableName, sizeTokens.paddingInline);
    assignVariable(variables, `${sizePrefix}-py` as CSSVariableName, sizeTokens.paddingBlock);
    assignVariable(variables, `${sizePrefix}-gap` as CSSVariableName, sizeTokens.gap);
    assignVariable(variables, `${sizePrefix}-font-size` as CSSVariableName, sizeTokens.fontSize);
    assignVariable(variables, `${sizePrefix}-line-height` as CSSVariableName, sizeTokens.lineHeight);
    assignVariable(variables, `${sizePrefix}-icon` as CSSVariableName, sizeTokens.icon);
    assignVariable(variables, `${sizePrefix}-clear` as CSSVariableName, sizeTokens.clear);
    assignVariable(variables, `${sizePrefix}-toggle` as CSSVariableName, sizeTokens.toggle);
  }

  return variables;
}

function createFormControlVariables(theme: Tokens): CSSVariableMap {
  const variables: CSSVariableMap = {} as CSSVariableMap;
  const formControl = theme.component.formControl;

  assignVariable(variables, "--ara-fc-radius", formControl.radius);
  assignVariable(variables, "--ara-fc-border-width", formControl.borderWidth);
  assignVariable(variables, "--ara-fc-disabled-opacity", formControl.disabled.opacity);
  assignVariable(
    variables,
    "--ara-fc-focus-outline",
    `${formControl.focus.outlineWidth} solid ${formControl.focus.outlineColor}`
  );
  assignVariable(
    variables,
    "--ara-fc-focus-outline-offset",
    formControl.focus.outlineOffset
  );
  assignVariable(
    variables,
    "--ara-fc-focus-ring",
    `0 0 0 ${formControl.focus.ringSize} ${formControl.focus.ringColor}`
  );

  for (const [toneName, toneTokens] of Object.entries(formControl.tone)) {
    const tonePrefix = `--ara-fc-tone-${toneName}`;

    for (const [stateName, value] of Object.entries(toneTokens.control)) {
      assignVariable(
        variables,
        `${tonePrefix}-control-${stateName}` as CSSVariableName,
        value
      );
    }

    for (const [stateName, value] of Object.entries(toneTokens.border)) {
      assignVariable(
        variables,
        `${tonePrefix}-border-${stateName}` as CSSVariableName,
        value
      );
    }

    for (const [stateName, value] of Object.entries(toneTokens.indicator)) {
      assignVariable(
        variables,
        `${tonePrefix}-indicator-${stateName}` as CSSVariableName,
        value
      );
    }

    for (const [stateName, value] of Object.entries(toneTokens.label)) {
      assignVariable(
        variables,
        `${tonePrefix}-label-${stateName}` as CSSVariableName,
        value
      );
    }
  }

  const defaultTone = formControl.tone.neutral;

  assignVariable(
    variables,
    "--ara-fc-control-default" as CSSVariableName,
    defaultTone.control.default
  );
  assignVariable(
    variables,
    "--ara-fc-control-hover" as CSSVariableName,
    defaultTone.control.hover
  );
  assignVariable(
    variables,
    "--ara-fc-control-focus" as CSSVariableName,
    defaultTone.control.focus
  );
  assignVariable(
    variables,
    "--ara-fc-control-disabled" as CSSVariableName,
    defaultTone.control.disabled
  );
  assignVariable(
    variables,
    "--ara-fc-control-invalid" as CSSVariableName,
    defaultTone.control.invalid
  );

  assignVariable(
    variables,
    "--ara-fc-border-default" as CSSVariableName,
    defaultTone.border.default
  );
  assignVariable(
    variables,
    "--ara-fc-border-hover" as CSSVariableName,
    defaultTone.border.hover
  );
  assignVariable(
    variables,
    "--ara-fc-border-focus" as CSSVariableName,
    defaultTone.border.focus
  );
  assignVariable(
    variables,
    "--ara-fc-border-disabled" as CSSVariableName,
    defaultTone.border.disabled
  );
  assignVariable(
    variables,
    "--ara-fc-border-invalid" as CSSVariableName,
    defaultTone.border.invalid
  );

  assignVariable(
    variables,
    "--ara-fc-indicator-default" as CSSVariableName,
    defaultTone.indicator.default
  );
  assignVariable(
    variables,
    "--ara-fc-indicator-disabled" as CSSVariableName,
    defaultTone.indicator.disabled
  );
  assignVariable(
    variables,
    "--ara-fc-indicator-invalid" as CSSVariableName,
    defaultTone.indicator.invalid
  );

  assignVariable(
    variables,
    "--ara-fc-label-default" as CSSVariableName,
    defaultTone.label.default
  );
  assignVariable(
    variables,
    "--ara-fc-label-disabled" as CSSVariableName,
    defaultTone.label.disabled
  );
  assignVariable(
    variables,
    "--ara-fc-label-invalid" as CSSVariableName,
    defaultTone.label.invalid
  );

  for (const [sizeName, sizeTokens] of Object.entries(formControl.size)) {
    const sizePrefix = `--ara-fc-size-${sizeName}`;

    assignVariable(variables, `${sizePrefix}-control` as CSSVariableName, sizeTokens.control);
    assignVariable(variables, `${sizePrefix}-gap` as CSSVariableName, sizeTokens.gap);
    assignVariable(
      variables,
      `${sizePrefix}-font-size` as CSSVariableName,
      sizeTokens.fontSize
    );
    assignVariable(
      variables,
      `${sizePrefix}-line-height` as CSSVariableName,
      sizeTokens.lineHeight
    );
    assignVariable(
      variables,
      `${sizePrefix}-track-width` as CSSVariableName,
      sizeTokens.trackWidth
    );
    assignVariable(
      variables,
      `${sizePrefix}-track-height` as CSSVariableName,
      sizeTokens.trackHeight
    );
    assignVariable(variables, `${sizePrefix}-thumb` as CSSVariableName, sizeTokens.thumb);
  }

  return variables;
}

function createButtonVariables(theme: Tokens): CSSVariableMap {
  const variables: CSSVariableMap = {} as CSSVariableMap;
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

      assignVariable(variables, `${prefix}-bg` as CSSVariableName, token.background);
      assignVariable(variables, `${prefix}-fg` as CSSVariableName, token.foreground);
      assignVariable(variables, `${prefix}-border` as CSSVariableName, token.border);
      assignVariable(
        variables,
        `${prefix}-bg-hover` as CSSVariableName,
        token.backgroundHover
      );
      assignVariable(
        variables,
        `${prefix}-fg-hover` as CSSVariableName,
        token.foregroundHover
      );
      assignVariable(
        variables,
        `${prefix}-border-hover` as CSSVariableName,
        token.borderHover
      );
      assignVariable(
        variables,
        `${prefix}-bg-active` as CSSVariableName,
        token.backgroundActive
      );
      assignVariable(
        variables,
        `${prefix}-fg-active` as CSSVariableName,
        token.foregroundActive
      );
      assignVariable(
        variables,
        `${prefix}-border-active` as CSSVariableName,
        token.borderActive
      );
      assignVariable(
        variables,
        `${prefix}-shadow` as CSSVariableName,
        token.shadow ?? "none"
      );
    }
  }

  for (const [sizeName, token] of Object.entries(button.size)) {
    const prefix = `--ara-btn-size-${sizeName}`;

    assignVariable(variables, `${prefix}-gap` as CSSVariableName, token.gap);
    assignVariable(
      variables,
      `${prefix}-px` as CSSVariableName,
      token.paddingInline
    );
    assignVariable(
      variables,
      `${prefix}-py` as CSSVariableName,
      token.paddingBlock
    );
    assignVariable(
      variables,
      `${prefix}-font-size` as CSSVariableName,
      token.fontSize
    );
    assignVariable(
      variables,
      `${prefix}-line-height` as CSSVariableName,
      token.lineHeight
    );
    assignVariable(
      variables,
      `${prefix}-min-height` as CSSVariableName,
      token.minHeight
    );
    assignVariable(
      variables,
      `${prefix}-spinner` as CSSVariableName,
      token.spinnerSize
    );
  }

  return variables;
}

function createIconVariables(theme: Tokens): CSSVariableMap {
  const variables: CSSVariableMap = {} as CSSVariableMap;
  const icon = theme.component.icon;

  for (const [sizeName, value] of Object.entries(icon.size)) {
    assignVariable(variables, `--ara-icon-size-${sizeName}` as CSSVariableName, value);
  }

  for (const [toneName, value] of Object.entries(icon.tone)) {
    assignVariable(variables, `--ara-icon-tone-${toneName}` as CSSVariableName, value);
  }

  for (const [strokeName, value] of Object.entries(icon.strokeWidth)) {
    assignVariable(
      variables,
      `--ara-icon-stroke-width-${strokeName}` as CSSVariableName,
      value
    );
  }

  return variables;
}

function createColorRoleVariables(
  theme: Tokens,
  themeName: ColorThemeName
): CSSVariableMap {
  const variables: CSSVariableMap = {} as CSSVariableMap;
  const role = theme.color.role[themeName];

  for (const [surfaceName, value] of Object.entries(role.surface)) {
    assignVariable(
      variables,
      `--ara-color-role-${themeName}-surface-${surfaceName}` as CSSVariableName,
      value
    );
  }

  for (const [textName, value] of Object.entries(role.text)) {
    assignVariable(
      variables,
      `--ara-color-role-${themeName}-text-${textName}` as CSSVariableName,
      value
    );
  }

  for (const [borderName, value] of Object.entries(role.border)) {
    assignVariable(
      variables,
      `--ara-color-role-${themeName}-border-${borderName}` as CSSVariableName,
      value
    );
  }

  for (const [roleName, states] of Object.entries(role.interactive)) {
    for (const [stateName, tokens] of Object.entries(states)) {
      const prefix = `--ara-color-role-${themeName}-interactive-${roleName}-${stateName}`;

      assignVariable(
        variables,
        `${prefix}-bg` as CSSVariableName,
        tokens.background
      );
      assignVariable(
        variables,
        `${prefix}-fg` as CSSVariableName,
        tokens.foreground
      );
      assignVariable(
        variables,
        `${prefix}-border` as CSSVariableName,
        tokens.border
      );
    }
  }

  return variables;
}

function mergeVariableMaps(...maps: CSSVariableMap[]): CSSVariableMap {
  return Object.assign({}, ...maps) as CSSVariableMap;
}

export function mergeCSSVariableMaps(...maps: CSSVariableMap[]): CSSVariableMap {
  return mergeVariableMaps(...maps);
}

export function createThemeCSSVariables(theme: Tokens): Record<ColorThemeName, CSSVariableMap> {
  const entries = Object.keys(theme.color.role).map((themeName) => {
    const name = themeName as ColorThemeName;
    return [name, createColorRoleVariables(theme, name)] as const;
  });

  return Object.fromEntries(entries) as Record<ColorThemeName, CSSVariableMap>;
}

export function createCSSVariableTable(theme: Tokens): ThemeCSSVariableTable {
  const root = mergeVariableMaps(
    createPaletteVariables(theme),
    createTypographyVariables(theme),
    createLayoutVariables(theme),
    createButtonVariables(theme),
    createFormControlVariables(theme),
    createIconVariables(theme),
    createTextFieldVariables(theme)
  );

  const themes = createThemeCSSVariables(theme);

  return { root, themes } satisfies ThemeCSSVariableTable;
}
