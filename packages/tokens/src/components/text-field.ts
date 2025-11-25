import { colors } from "../colors.js";
import { typography } from "../typography.js";

type StateTokens<TStates extends readonly string[]> = {
  readonly [State in TStates[number]]: string;
};

type TextFieldState = "default" | "hover" | "focus" | "disabled" | "invalid";

type TextFieldToneTokens = {
  readonly surface: StateTokens<readonly TextFieldState[]>;
  readonly border: StateTokens<readonly TextFieldState[]>;
  readonly text: StateTokens<readonly ["default", "disabled", "invalid"]>;
};

type TextFieldToneName = "primary" | "neutral" | "danger";
type TextFieldToneMap = Record<TextFieldToneName, TextFieldToneTokens>;

type TextFieldSizeToken = {
  readonly height: string;
  readonly paddingInline: string;
  readonly paddingBlock: string;
  readonly gap: string;
  readonly fontSize: string;
  readonly lineHeight: string;
  readonly icon: string;
  readonly clear: string;
  readonly toggle: string;
};

type TextFieldSizeMap = Record<string, TextFieldSizeToken>;

function createToneTokens(): TextFieldToneMap {
  const lightRole = colors.role.light;
  const dangerInteraction = lightRole.interactive.danger;

  const toneSources = {
    primary: lightRole.interactive.primary,
    neutral: lightRole.interactive.neutral,
    danger: dangerInteraction
  } satisfies Record<TextFieldToneName, (typeof lightRole.interactive)[TextFieldToneName]>;

  return Object.fromEntries(
    Object.entries(toneSources).map(([toneName, interaction]) => {
      const surface: TextFieldToneTokens["surface"] = {
        default: lightRole.surface.surface,
        hover: colors.palette.neutral["50"],
        focus: lightRole.surface.surface,
        disabled: interaction.disabled.background,
        invalid: lightRole.surface.surface
      } as const;

      const border: TextFieldToneTokens["border"] = {
        default: interaction.default.border,
        hover: interaction.hover.border,
        focus: lightRole.border.focus,
        disabled: interaction.disabled.border,
        invalid: dangerInteraction.default.border
      } as const;

      const text: TextFieldToneTokens["text"] = {
        default: lightRole.text.primary,
        disabled: colors.palette.neutral["400"],
        invalid: colors.palette.danger["700"]
      } as const;

      return [toneName, { surface, border, text } satisfies TextFieldToneTokens];
    })
  ) as TextFieldToneMap;
}

function createSizeMap(): TextFieldSizeMap {
  return {
    sm: {
      height: "2.25rem",
      paddingInline: "0.5rem",
      paddingBlock: "0.375rem",
      gap: "0.375rem",
      fontSize: typography.fontSize.sm,
      lineHeight: "1.4",
      icon: "1rem",
      clear: "1.25rem",
      toggle: "1.25rem"
    },
    md: {
      height: "2.75rem",
      paddingInline: "0.75rem",
      paddingBlock: "0.5rem",
      gap: "0.5rem",
      fontSize: typography.fontSize.md,
      lineHeight: typography.lineHeight.normal,
      icon: "1.25rem",
      clear: "1.25rem",
      toggle: "1.25rem"
    },
    lg: {
      height: "3.25rem",
      paddingInline: "1rem",
      paddingBlock: "0.75rem",
      gap: "0.625rem",
      fontSize: typography.fontSize.lg,
      lineHeight: typography.lineHeight.normal,
      icon: "1.35rem",
      clear: "1.35rem",
      toggle: "1.35rem"
    }
  } satisfies TextFieldSizeMap;
}

export const textField = {
  font: {
    family: typography.fontFamily.sans,
    weight: typography.fontWeight.regular
  },
  radius: "0.5rem",
  borderWidth: "1px",
  disabled: {
    opacity: 0.6
  },
  focus: {
    outlineWidth: "2px",
    outlineColor: colors.role.light.border.focus,
    ringSize: "4px",
    ringColor: "rgba(96, 165, 250, 0.2)"
  },
  tone: createToneTokens(),
  size: createSizeMap()
} as const;

export type TextFieldTokens = typeof textField;
