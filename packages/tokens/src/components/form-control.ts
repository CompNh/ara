import { colors } from "../colors.js";
import { typography } from "../typography.js";

type StateTokens<TStates extends readonly string[]> = {
  readonly [State in TStates[number]]: string;
};

type FormControlState = "default" | "hover" | "focus" | "disabled" | "invalid";

type FormControlToneTokens = {
  readonly control: StateTokens<readonly FormControlState[]>;
  readonly border: StateTokens<readonly FormControlState[]>;
  readonly indicator: StateTokens<readonly ["default", "disabled", "invalid"]>;
  readonly label: StateTokens<readonly ["default", "disabled", "invalid"]>;
};

type FormControlToneName = "primary" | "neutral" | "danger";
type FormControlToneMap = Record<FormControlToneName, FormControlToneTokens>;

type FormControlSizeTokens = {
  readonly control: string;
  readonly gap: string;
  readonly fontSize: string;
  readonly lineHeight: string;
  readonly trackWidth: string;
  readonly trackHeight: string;
  readonly thumb: string;
};

type FormControlSizeMap = Record<"sm" | "md" | "lg", FormControlSizeTokens>;

function createToneTokens(): FormControlToneMap {
  const lightRole = colors.role.light;
  const dangerInteraction = lightRole.interactive.danger;

  const toneSources = {
    primary: lightRole.interactive.primary,
    neutral: lightRole.interactive.neutral,
    danger: dangerInteraction
  } satisfies Record<FormControlToneName, (typeof lightRole.interactive)[FormControlToneName]>;

  return Object.fromEntries(
    Object.entries(toneSources).map(([toneName, interaction]) => {
      const control: FormControlToneTokens["control"] = {
        default: lightRole.surface.surface,
        hover: colors.palette.neutral["50"],
        focus: lightRole.surface.surface,
        disabled: interaction.disabled.background,
        invalid: lightRole.surface.surface
      } as const;

      const border: FormControlToneTokens["border"] = {
        default: interaction.default.border,
        hover: interaction.hover.border,
        focus: lightRole.border.focus,
        disabled: interaction.disabled.border,
        invalid: dangerInteraction.default.border
      } as const;

      const indicator: FormControlToneTokens["indicator"] = {
        default: interaction.default.foreground,
        disabled: interaction.disabled.foreground,
        invalid: dangerInteraction.default.foreground
      } as const;

      const label: FormControlToneTokens["label"] = {
        default: lightRole.text.primary,
        disabled: colors.palette.neutral["500"],
        invalid: colors.palette.danger["700"]
      } as const;

      return [toneName, { control, border, indicator, label } satisfies FormControlToneTokens];
    })
  ) as FormControlToneMap;
}

function createSizeTokens(): FormControlSizeMap {
  return {
    sm: {
      control: "1rem",
      gap: "0.5rem",
      fontSize: typography.fontSize.sm,
      lineHeight: "1.4",
      trackWidth: "2.25rem",
      trackHeight: "1.25rem",
      thumb: "1rem"
    },
    md: {
      control: "1.125rem",
      gap: "0.625rem",
      fontSize: typography.fontSize.md,
      lineHeight: typography.lineHeight.normal,
      trackWidth: "2.5rem",
      trackHeight: "1.375rem",
      thumb: "1.125rem"
    },
    lg: {
      control: "1.25rem",
      gap: "0.75rem",
      fontSize: typography.fontSize.lg,
      lineHeight: typography.lineHeight.normal,
      trackWidth: "2.75rem",
      trackHeight: "1.5rem",
      thumb: "1.25rem"
    }
  } satisfies FormControlSizeMap;
}

export const formControl = {
  radius: "0.375rem",
  borderWidth: "1px",
  disabled: {
    opacity: 0.6
  },
  focus: {
    outlineWidth: "2px",
    outlineOffset: "2px",
    outlineColor: colors.role.light.border.focus,
    ringSize: "4px",
    ringColor: "rgba(96, 165, 250, 0.22)"
  },
  tone: createToneTokens(),
  size: createSizeTokens()
} as const;

export type FormControlTokens = typeof formControl;
