import { colors } from "../colors.js";
import { typography } from "../typography.js";

type TonePalette = {
  readonly interaction: import("../colors.js").InteractionTokens;
  readonly subtleBackground: string;
  readonly subtleBackgroundHover: string;
  readonly subtleBackgroundActive: string;
};

type VariantToken = {
  readonly background: string;
  readonly foreground: string;
  readonly border: string;
  readonly backgroundHover: string;
  readonly foregroundHover: string;
  readonly borderHover: string;
  readonly backgroundActive: string;
  readonly foregroundActive: string;
  readonly borderActive: string;
  readonly shadow?: string;
};

type VariantMap = Record<string, Record<string, VariantToken>>;

type SizeToken = {
  readonly paddingInline: string;
  readonly paddingBlock: string;
  readonly gap: string;
  readonly fontSize: string;
  readonly lineHeight: string;
  readonly minHeight: string;
  readonly spinnerSize: string;
};

type SizeMap = Record<string, SizeToken>;

const lightTheme = colors.role.light;

const tonePalettes: Record<string, TonePalette> = {
  primary: {
    interaction: lightTheme.interactive.primary,
    subtleBackground: colors.palette.brand["50"],
    subtleBackgroundHover: colors.palette.brand["100"],
    subtleBackgroundActive: colors.palette.brand["200"]
  },
  neutral: {
    interaction: lightTheme.interactive.neutral,
    subtleBackground: colors.palette.neutral["50"],
    subtleBackgroundHover: colors.palette.neutral["100"],
    subtleBackgroundActive: colors.palette.neutral["200"]
  },
  danger: {
    interaction: lightTheme.interactive.danger,
    subtleBackground: colors.palette.danger["50"],
    subtleBackgroundHover: colors.palette.danger["100"],
    subtleBackgroundActive: colors.palette.danger["200"]
  }
};

function createSolidVariant(palette: TonePalette): VariantToken {
  const { interaction } = palette;

  return {
    background: interaction.default.background,
    foreground: interaction.default.foreground,
    border: interaction.default.border,
    backgroundHover: interaction.hover.background,
    foregroundHover: interaction.hover.foreground,
    borderHover: interaction.hover.border,
    backgroundActive: interaction.active.background,
    foregroundActive: interaction.active.foreground,
    borderActive: interaction.active.border
  };
}

function createOutlineVariant(palette: TonePalette): VariantToken {
  const { interaction } = palette;

  return {
    background: lightTheme.surface.surface,
    foreground: interaction.default.foreground,
    border: interaction.default.border,
    backgroundHover: palette.subtleBackground,
    foregroundHover: interaction.hover.foreground,
    borderHover: interaction.hover.border,
    backgroundActive: palette.subtleBackgroundActive,
    foregroundActive: interaction.active.foreground,
    borderActive: interaction.active.border
  };
}

function createGhostVariant(palette: TonePalette): VariantToken {
  const { interaction } = palette;

  return {
    background: "transparent",
    foreground: interaction.default.foreground,
    border: "transparent",
    backgroundHover: palette.subtleBackground,
    foregroundHover: interaction.hover.foreground,
    borderHover: "transparent",
    backgroundActive: palette.subtleBackgroundActive,
    foregroundActive: interaction.active.foreground,
    borderActive: "transparent"
  };
}

function createVariantMap(): VariantMap {
  const solid: Record<string, VariantToken> = {};
  const outline: Record<string, VariantToken> = {};
  const ghost: Record<string, VariantToken> = {};

  for (const [tone, palette] of Object.entries(tonePalettes)) {
    solid[tone] = createSolidVariant(palette);
    outline[tone] = createOutlineVariant(palette);
    ghost[tone] = createGhostVariant(palette);
  }

  return { solid, outline, ghost } satisfies VariantMap;
}

function createSizeMap(): SizeMap {
  return {
    sm: {
      paddingInline: "0.75rem",
      paddingBlock: "0.375rem",
      gap: "0.375rem",
      fontSize: typography.fontSize.sm,
      lineHeight: typography.lineHeight.normal,
      minHeight: "2.25rem",
      spinnerSize: "16px"
    },
    md: {
      paddingInline: "1rem",
      paddingBlock: "0.5rem",
      gap: "0.5rem",
      fontSize: typography.fontSize.md,
      lineHeight: typography.lineHeight.normal,
      minHeight: "2.5rem",
      spinnerSize: "18px"
    },
    lg: {
      paddingInline: "1.25rem",
      paddingBlock: "0.75rem",
      gap: "0.75rem",
      fontSize: typography.fontSize.lg,
      lineHeight: typography.lineHeight.normal,
      minHeight: "3rem",
      spinnerSize: "20px"
    }
  } satisfies SizeMap;
}

export const button = {
  radius: "0.75rem",
  borderWidth: "1px",
  font: {
    family: typography.fontFamily.sans,
    weight: typography.fontWeight.medium
  },
  focus: {
    outlineWidth: "2px",
    outlineColor: lightTheme.border.focus,
    outlineOffset: "2px",
    ringSize: "4px",
    ringColor: colors.palette.brand["100"]
  },
  disabled: {
    opacity: 0.6
  },
  variant: createVariantMap(),
  size: createSizeMap()
} as const;

export type ButtonTokens = typeof button;
