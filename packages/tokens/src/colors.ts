type HexColor = `#${string}`;

type InteractionState = {
  readonly background: HexColor | "transparent";
  readonly foreground: HexColor;
  readonly border: HexColor | "transparent";
};

export type InteractionTokens = {
  readonly default: InteractionState;
  readonly hover: InteractionState;
  readonly active: InteractionState;
  readonly disabled: InteractionState;
};

type TextTokens = {
  readonly primary: HexColor;
  readonly secondary: HexColor;
  readonly tertiary: HexColor;
  readonly inverse: HexColor;
  readonly link: HexColor;
};

type SurfaceTokens = {
  readonly canvas: HexColor;
  readonly surface: HexColor;
  readonly elevated: HexColor;
  readonly overlay: HexColor;
  readonly inverse: HexColor;
};

type BorderTokens = {
  readonly subtle: HexColor;
  readonly default: HexColor;
  readonly strong: HexColor;
  readonly inverse: HexColor;
  readonly focus: HexColor;
};

type ThemeColorRoleShape = {
  readonly surface: SurfaceTokens;
  readonly text: TextTokens;
  readonly border: BorderTokens;
  readonly interactive: {
    readonly primary: InteractionTokens;
    readonly neutral: InteractionTokens;
    readonly danger: InteractionTokens;
  };
};

const palette = {
  brand: {
    "50": "#EFF6FF",
    "100": "#DBEAFE",
    "200": "#BFDBFE",
    "300": "#93C5FD",
    "400": "#60A5FA",
    "500": "#3B82F6",
    "600": "#2563EB",
    "700": "#1D4ED8",
    "800": "#1E40AF",
    "900": "#1E3A8A"
  },
  neutral: {
    "50": "#F8FAFC",
    "100": "#EEF2F6",
    "200": "#E2E8F0",
    "300": "#CBD5E1",
    "400": "#94A3B8",
    "500": "#64748B",
    "600": "#475569",
    "700": "#334155",
    "800": "#1E293B",
    "900": "#0F172A"
  },
  danger: {
    "50": "#FFF1F2",
    "100": "#FFE4E6",
    "200": "#FECDD3",
    "300": "#FDA4AF",
    "400": "#FB7185",
    "500": "#F43F5E",
    "600": "#E11D48",
    "700": "#BE123C",
    "800": "#9F1239",
    "900": "#881337"
  },
  success: {
    "50": "#F0FDF4",
    "100": "#DCFCE7",
    "200": "#BBF7D0",
    "300": "#86EFAC",
    "400": "#4ADE80",
    "500": "#22C55E",
    "600": "#16A34A",
    "700": "#15803D",
    "800": "#166534",
    "900": "#14532D"
  },
  warning: {
    "50": "#FFFBEB",
    "100": "#FEF3C7",
    "200": "#FDE68A",
    "300": "#FCD34D",
    "400": "#FBBF24",
    "500": "#F59E0B",
    "600": "#D97706",
    "700": "#B45309",
    "800": "#92400E",
    "900": "#78350F"
  }
} as const;

function createInteractionTokens(definition: {
  readonly background: HexColor;
  readonly foreground: HexColor;
  readonly border: HexColor;
  readonly hoverBackground: HexColor;
  readonly hoverForeground: HexColor;
  readonly hoverBorder: HexColor;
  readonly activeBackground: HexColor;
  readonly activeForeground: HexColor;
  readonly activeBorder: HexColor;
  readonly disabledBackground: HexColor;
  readonly disabledForeground: HexColor;
  readonly disabledBorder: HexColor;
}): InteractionTokens {
  return {
    default: {
      background: definition.background,
      foreground: definition.foreground,
      border: definition.border
    },
    hover: {
      background: definition.hoverBackground,
      foreground: definition.hoverForeground,
      border: definition.hoverBorder
    },
    active: {
      background: definition.activeBackground,
      foreground: definition.activeForeground,
      border: definition.activeBorder
    },
    disabled: {
      background: definition.disabledBackground,
      foreground: definition.disabledForeground,
      border: definition.disabledBorder
    }
  } as const;
}

function createLightRole(): ThemeColorRoleShape {
  const text: TextTokens = {
    primary: palette.neutral["900"],
    secondary: palette.neutral["700"],
    tertiary: palette.neutral["500"],
    inverse: palette.neutral["50"],
    link: palette.brand["600"]
  } as const;

  const surface: SurfaceTokens = {
    canvas: palette.neutral["50"],
    surface: "#FFFFFF",
    elevated: "#FFFFFF",
    overlay: "#0F172A99",
    inverse: palette.neutral["900"]
  } as const;

  const border: BorderTokens = {
    subtle: palette.neutral["200"],
    default: palette.neutral["300"],
    strong: palette.neutral["400"],
    inverse: palette.neutral["800"],
    focus: palette.brand["400"]
  } as const;

  return {
    surface,
    text,
    border,
    interactive: {
      primary: createInteractionTokens({
        background: palette.brand["600"],
        foreground: "#FFFFFF",
        border: palette.brand["600"],
        hoverBackground: palette.brand["700"],
        hoverForeground: "#FFFFFF",
        hoverBorder: palette.brand["700"],
        activeBackground: palette.brand["800"],
        activeForeground: "#FFFFFF",
        activeBorder: palette.brand["800"],
        disabledBackground: palette.neutral["200"],
        disabledForeground: palette.neutral["500"],
        disabledBorder: palette.neutral["300"]
      }),
      neutral: createInteractionTokens({
        background: "#FFFFFF",
        foreground: palette.neutral["700"],
        border: palette.neutral["300"],
        hoverBackground: palette.neutral["100"],
        hoverForeground: palette.neutral["800"],
        hoverBorder: palette.neutral["400"],
        activeBackground: palette.neutral["200"],
        activeForeground: palette.neutral["900"],
        activeBorder: palette.neutral["500"],
        disabledBackground: palette.neutral["100"],
        disabledForeground: palette.neutral["400"],
        disabledBorder: palette.neutral["200"]
      }),
      danger: createInteractionTokens({
        background: palette.danger["600"],
        foreground: "#FFFFFF",
        border: palette.danger["600"],
        hoverBackground: palette.danger["700"],
        hoverForeground: "#FFFFFF",
        hoverBorder: palette.danger["700"],
        activeBackground: palette.danger["800"],
        activeForeground: "#FFFFFF",
        activeBorder: palette.danger["800"],
        disabledBackground: palette.danger["100"],
        disabledForeground: palette.danger["400"],
        disabledBorder: palette.danger["200"]
      })
    }
  } as const;
}

function createDarkRole(): ThemeColorRoleShape {
  const text: TextTokens = {
    primary: palette.neutral["50"],
    secondary: palette.neutral["200"],
    tertiary: palette.neutral["400"],
    inverse: palette.neutral["900"],
    link: palette.brand["300"]
  } as const;

  const surface: SurfaceTokens = {
    canvas: palette.neutral["900"],
    surface: "#111827",
    elevated: "#1F2937",
    overlay: "#0F172ACC",
    inverse: "#FFFFFF"
  } as const;

  const border: BorderTokens = {
    subtle: palette.neutral["700"],
    default: palette.neutral["600"],
    strong: palette.neutral["500"],
    inverse: palette.neutral["200"],
    focus: palette.brand["400"]
  } as const;

  return {
    surface,
    text,
    border,
    interactive: {
      primary: createInteractionTokens({
        background: palette.brand["400"],
        foreground: palette.neutral["900"],
        border: palette.brand["400"],
        hoverBackground: palette.brand["300"],
        hoverForeground: palette.neutral["900"],
        hoverBorder: palette.brand["300"],
        activeBackground: palette.brand["200"],
        activeForeground: palette.neutral["900"],
        activeBorder: palette.brand["200"],
        disabledBackground: palette.neutral["800"],
        disabledForeground: palette.neutral["500"],
        disabledBorder: palette.neutral["700"]
      }),
      neutral: createInteractionTokens({
        background: "#1F2937",
        foreground: palette.neutral["100"],
        border: palette.neutral["700"],
        hoverBackground: palette.neutral["800"],
        hoverForeground: palette.neutral["50"],
        hoverBorder: palette.neutral["600"],
        activeBackground: palette.neutral["900"],
        activeForeground: palette.neutral["50"],
        activeBorder: palette.neutral["500"],
        disabledBackground: palette.neutral["800"],
        disabledForeground: palette.neutral["500"],
        disabledBorder: palette.neutral["800"]
      }),
      danger: createInteractionTokens({
        background: palette.danger["400"],
        foreground: palette.neutral["900"],
        border: palette.danger["400"],
        hoverBackground: palette.danger["300"],
        hoverForeground: palette.neutral["900"],
        hoverBorder: palette.danger["300"],
        activeBackground: palette.danger["200"],
        activeForeground: palette.neutral["900"],
        activeBorder: palette.danger["200"],
        disabledBackground: palette.danger["800"],
        disabledForeground: palette.danger["400"],
        disabledBorder: palette.danger["700"]
      })
    }
  } as const;
}

const role = {
  light: createLightRole(),
  dark: createDarkRole()
} as const;

export const colors = {
  palette,
  role
} as const;

export type ColorPalette = typeof palette;
export type ColorRampName = keyof ColorPalette;
export type ColorRamp<TName extends ColorRampName = ColorRampName> = ColorPalette[TName];
export type ColorShade<TName extends ColorRampName = ColorRampName> = keyof ColorPalette[TName] & string;

export type ColorRoleMap = typeof role;
export type ColorThemeName = keyof ColorRoleMap;
export type ThemeColorRole<TTheme extends ColorThemeName = ColorThemeName> = ColorRoleMap[TTheme];
export type InteractiveRoleName<TTheme extends ColorThemeName = ColorThemeName> = keyof ThemeColorRole<TTheme>["interactive"];
export type InteractiveColorTokens<
  TTheme extends ColorThemeName = ColorThemeName,
  TRole extends InteractiveRoleName<TTheme> = InteractiveRoleName<TTheme>
> = ThemeColorRole<TTheme>["interactive"][TRole];
export type InteractiveColorStateName<TTheme extends ColorThemeName = ColorThemeName, TRole extends InteractiveRoleName<TTheme> = InteractiveRoleName<TTheme>> =
  keyof InteractiveColorTokens<TTheme, TRole>;

export function getColor<R extends ColorRampName, S extends ColorShade<R>>(ramp: R, shade: S): ColorPalette[R][S] {
  return palette[ramp][shade];
}
