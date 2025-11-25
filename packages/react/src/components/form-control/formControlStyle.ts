import type { Theme } from "@ara/core";

type FormControlSize = "sm" | "md" | "lg";

const DEFAULT_SIZE: FormControlSize = "md";

const cssVar = (name: string, fallback: string) => `var(${name}, ${fallback})`;

export interface FormControlStyleTokens {
  readonly gap: string;
  readonly fontSize: string;
  readonly lineHeight: string;
  readonly controlSize: string;
  readonly trackWidth: string;
  readonly trackHeight: string;
  readonly thumbSize: string;
  readonly radius: string;
  readonly borderWidth: string;
  readonly disabledOpacity: string;
  readonly focusOutline: string;
  readonly focusOutlineOffset: string;
  readonly focusRing: string;
  readonly controlColor: Record<"default" | "hover" | "focus" | "disabled" | "invalid", string>;
  readonly borderColor: Record<"default" | "hover" | "focus" | "disabled" | "invalid", string>;
  readonly indicatorColor: Record<"default" | "disabled" | "invalid", string>;
  readonly labelColor: Record<"default" | "disabled" | "invalid", string>;
}

export function createFormControlStyleTokens(
  theme: Theme,
  size: FormControlSize = DEFAULT_SIZE
): FormControlStyleTokens {
  const formControl = theme.component.formControl;
  const sizeTokens = formControl.size[size];

  const gap = cssVar("--ara-fc-gap", cssVar(`--ara-fc-size-${size}-gap`, sizeTokens.gap));
  const fontSize = cssVar(
    "--ara-fc-font-size",
    cssVar(`--ara-fc-size-${size}-font-size`, sizeTokens.fontSize)
  );
  const lineHeight = cssVar(
    "--ara-fc-line-height",
    cssVar(`--ara-fc-size-${size}-line-height`, sizeTokens.lineHeight)
  );
  const controlSize = cssVar(
    "--ara-fc-control-size",
    cssVar(`--ara-fc-size-${size}-control`, sizeTokens.control)
  );
  const trackWidth = cssVar(
    "--ara-fc-track-width",
    cssVar(`--ara-fc-size-${size}-track-width`, sizeTokens.trackWidth)
  );
  const trackHeight = cssVar(
    "--ara-fc-track-height",
    cssVar(`--ara-fc-size-${size}-track-height`, sizeTokens.trackHeight)
  );
  const thumbSize = cssVar(
    "--ara-fc-thumb-size",
    cssVar(`--ara-fc-size-${size}-thumb`, sizeTokens.thumb)
  );
  const radius = cssVar("--ara-fc-radius", formControl.radius);
  const borderWidth = cssVar("--ara-fc-border-width", formControl.borderWidth);
  const disabledOpacity = cssVar("--ara-fc-disabled-opacity", `${formControl.disabled.opacity}`);
  const focusOutline = cssVar(
    "--ara-fc-focus-outline",
    `${formControl.focus.outlineWidth} solid ${formControl.focus.outlineColor}`
  );
  const focusOutlineOffset = cssVar("--ara-fc-focus-outline-offset", formControl.focus.outlineOffset);
  const focusRing = cssVar(
    "--ara-fc-focus-ring",
    `0 0 0 ${formControl.focus.ringSize} ${formControl.focus.ringColor}`
  );

  const controlTone = formControl.tone.neutral.control;
  const borderTone = formControl.tone.neutral.border;
  const indicatorTone = formControl.tone.neutral.indicator;
  const labelTone = formControl.tone.neutral.label;

  return {
    gap,
    fontSize,
    lineHeight,
    controlSize,
    trackWidth,
    trackHeight,
    thumbSize,
    radius,
    borderWidth,
    disabledOpacity,
    focusOutline,
    focusOutlineOffset,
    focusRing,
    controlColor: {
      default: cssVar("--ara-fc-control-default", controlTone.default),
      hover: cssVar("--ara-fc-control-hover", controlTone.hover),
      focus: cssVar("--ara-fc-control-focus", controlTone.focus),
      disabled: cssVar("--ara-fc-control-disabled", controlTone.disabled),
      invalid: cssVar("--ara-fc-control-invalid", controlTone.invalid)
    },
    borderColor: {
      default: cssVar("--ara-fc-border-default", borderTone.default),
      hover: cssVar("--ara-fc-border-hover", borderTone.hover),
      focus: cssVar("--ara-fc-border-focus", borderTone.focus),
      disabled: cssVar("--ara-fc-border-disabled", borderTone.disabled),
      invalid: cssVar("--ara-fc-border-invalid", borderTone.invalid)
    },
    indicatorColor: {
      default: cssVar("--ara-fc-indicator-default", indicatorTone.default),
      disabled: cssVar("--ara-fc-indicator-disabled", indicatorTone.disabled),
      invalid: cssVar("--ara-fc-indicator-invalid", indicatorTone.invalid)
    },
    labelColor: {
      default: cssVar("--ara-fc-label-default", labelTone.default),
      disabled: cssVar("--ara-fc-label-disabled", labelTone.disabled),
      invalid: cssVar("--ara-fc-label-invalid", labelTone.invalid)
    }
  };
}
