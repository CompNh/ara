import { colors } from "../colors.js";
import { typography } from "../typography.js";

type TonePalette = {
  readonly base: string;
  readonly emphasis: string;
  readonly emphasisAlt: string;
  readonly contrast: string;
  readonly subtle: string;
  readonly subtleAlt: string;
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

const tonePalettes: Record<string, TonePalette> = {
  primary: {
    base: colors.brand["500"],
    emphasis: colors.brand["600"],
    emphasisAlt: colors.brand["700"],
    subtle: colors.brand["50"],
    subtleAlt: colors.brand["100"],
    contrast: colors.neutral["50"]
  },
  neutral: {
    base: colors.neutral["100"],
    emphasis: colors.neutral["200"],
    emphasisAlt: colors.neutral["300"],
    subtle: colors.neutral["50"],
    subtleAlt: colors.neutral["100"],
    contrast: colors.neutral["900"]
  },
  danger: {
    base: colors.accent["500"],
    emphasis: colors.accent["600"],
    emphasisAlt: colors.accent["700"],
    subtle: colors.accent["100"],
    subtleAlt: colors.accent["200"],
    contrast: colors.neutral["50"]
  }
};

function createSolidVariant(palette: TonePalette): VariantToken {
  return {
    background: palette.base,
    foreground: palette.contrast,
    border: palette.base,
    backgroundHover: palette.emphasis,
    foregroundHover: palette.contrast,
    borderHover: palette.emphasis,
    backgroundActive: palette.emphasisAlt,
    foregroundActive: palette.contrast,
    borderActive: palette.emphasisAlt
  };
}

function createOutlineVariant(palette: TonePalette): VariantToken {
  return {
    background: "transparent",
    foreground: palette.base,
    border: palette.base,
    backgroundHover: palette.subtle,
    foregroundHover: palette.emphasis,
    borderHover: palette.emphasis,
    backgroundActive: palette.subtleAlt,
    foregroundActive: palette.emphasisAlt,
    borderActive: palette.emphasisAlt
  };
}

function createGhostVariant(palette: TonePalette): VariantToken {
  return {
    background: "transparent",
    foreground: palette.base,
    border: "transparent",
    backgroundHover: palette.subtle,
    foregroundHover: palette.emphasis,
    borderHover: "transparent",
    backgroundActive: palette.subtleAlt,
    foregroundActive: palette.emphasisAlt,
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
    outlineColor: colors.brand["300"],
    outlineOffset: "2px",
    ringSize: "4px",
    ringColor: colors.brand["100"]
  },
  disabled: {
    opacity: 0.6
  },
  variant: createVariantMap(),
  size: createSizeMap()
} as const;

export type ButtonTokens = typeof button;
