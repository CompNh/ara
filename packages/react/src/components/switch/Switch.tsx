import {
  forwardRef,
  useMemo,
  type CSSProperties,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref
} from "react";
import { composeRefs } from "@radix-ui/react-compose-refs";
import { useSwitch } from "@ara/core";
import { createFormControlStyleTokens } from "../form-control/formControlStyle.js";
import { useAraTheme } from "../../theme/index.js";

const visuallyHiddenStyle: CSSProperties = {
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: 0,
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0
};

function mergeClassNames(...values: Array<string | undefined | null | false>): string {
  return values.filter(Boolean).join(" ");
}

function composeEventHandlers<Event>(
  ours: ((event: Event) => void) | undefined,
  theirs: ((event: Event) => void) | undefined
): ((event: Event) => void) | undefined {
  if (!ours && !theirs) return undefined;
  return (event: Event) => {
    ours?.(event);
    theirs?.(event);
  };
}

interface SwitchOwnProps {
  readonly label?: ReactNode;
  readonly description?: ReactNode;
  readonly invalid?: boolean;
  readonly inputRef?: Ref<HTMLInputElement>;
  readonly describedBy?: string | readonly string[];
  readonly labelledBy?: string | readonly string[];
  readonly trackClassName?: string;
  readonly thumbClassName?: string;
  readonly onCheckedChange?: (checked: boolean) => void;
}

type SwitchInputProps = Pick<
  InputHTMLAttributes<HTMLInputElement>,
  "id" | "name" | "required" | "disabled" | "readOnly"
> & { readonly value?: string };

export type SwitchProps = SwitchOwnProps &
  SwitchInputProps &
  Pick<HTMLAttributes<HTMLDivElement>, "className" | "style" | "onClick" | "onKeyDown"> & {
    readonly checked?: boolean;
    readonly defaultChecked?: boolean;
  };

export const Switch = forwardRef<HTMLDivElement, SwitchProps>(function Switch(props, ref) {
  const {
    id,
    name,
    value,
    checked,
    defaultChecked,
    required,
    disabled,
    readOnly,
    invalid,
    label,
    description,
    inputRef,
    describedBy,
    labelledBy,
    className,
    style,
    trackClassName,
    thumbClassName,
    onCheckedChange,
    onClick,
    onKeyDown,
    ...restProps
  } = props;

  const theme = useAraTheme();
  const tokens = useMemo(() => createFormControlStyleTokens(theme), [theme]);

  const describedByIds = useMemo(() => {
    if (!describedBy) return [] as string[];
    return Array.isArray(describedBy) ? [...describedBy] : [describedBy];
  }, [describedBy]);

  const labelledByIds = useMemo(() => {
    if (!labelledBy) return [] as string[];
    return Array.isArray(labelledBy) ? [...labelledBy] : [labelledBy];
  }, [labelledBy]);

  const { rootProps, inputProps, labelProps, descriptionProps } = useSwitch({
    id,
    name,
    value,
    checked,
    defaultChecked,
    required,
    disabled,
    readOnly,
    invalid,
    hasLabel: Boolean(label),
    hasDescription: Boolean(description),
    describedByIds,
    labelledByIds,
    onCheckedChange
  });

  const isDisabled = Boolean(rootProps["data-disabled"]);
  const isInvalid = Boolean(rootProps["data-invalid"]);
  const isChecked = rootProps["data-state"] === "checked";

  const labelColor = isDisabled
    ? tokens.labelColor.disabled
    : isInvalid
      ? tokens.labelColor.invalid
      : tokens.labelColor.default;
  const indicatorColor = isDisabled
    ? tokens.indicatorColor.disabled
    : isInvalid
      ? tokens.indicatorColor.invalid
      : tokens.indicatorColor.default;
  const controlBackground = isDisabled
    ? tokens.controlColor.disabled
    : isInvalid
      ? tokens.controlColor.invalid
      : tokens.controlColor.default;
  const trackBorder = isDisabled
    ? tokens.borderColor.disabled
    : isInvalid
      ? tokens.borderColor.invalid
      : isChecked
        ? indicatorColor
        : tokens.borderColor.default;

  const rootStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "flex-start",
    gap: tokens.gap,
    fontSize: tokens.fontSize,
    lineHeight: tokens.lineHeight,
    color: labelColor,
    cursor: isDisabled ? "not-allowed" : "pointer",
    userSelect: "none",
    opacity: isDisabled ? tokens.disabledOpacity : 1
  };

  const thumbOffset = `calc((${tokens.trackHeight} - ${tokens.thumbSize}) / 2)`;

  const trackStyle: CSSProperties = {
    width: tokens.trackWidth,
    height: tokens.trackHeight,
    borderRadius: `calc(${tokens.trackHeight} / 2)`,
    borderWidth: tokens.borderWidth,
    borderStyle: "solid",
    backgroundColor: isChecked ? indicatorColor : controlBackground,
    borderColor: trackBorder,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: isChecked ? "flex-end" : "flex-start",
    paddingInline: thumbOffset,
    paddingBlock: thumbOffset,
    flexShrink: 0,
    transition: "background-color 150ms ease, border-color 150ms ease"
  };

  const thumbStyle: CSSProperties = {
    width: tokens.thumbSize,
    height: tokens.thumbSize,
    borderRadius: "999px",
    backgroundColor: isDisabled ? controlBackground : "white",
    boxShadow: "0 1px 2px rgba(15, 23, 42, 0.18)",
    transition: "transform 150ms ease, background-color 150ms ease",
    transform: "translateZ(0)"
  };

  const mergedRootProps = useMemo(
    () => ({
      ...rootProps,
      onClick: composeEventHandlers(rootProps.onClick, onClick),
      onKeyDown: composeEventHandlers(rootProps.onKeyDown, onKeyDown)
    }),
    [onClick, onKeyDown, rootProps]
  );

  const mergedInputRef = composeRefs(inputProps.ref, inputRef);

  return (
    <div
      {...restProps}
      ref={ref}
      className={mergeClassNames("ara-switch", className)}
      style={{ ...rootStyle, ...style }}
      data-state={rootProps["data-state"]}
      data-disabled={rootProps["data-disabled"]}
      data-readonly={rootProps["data-readonly"]}
      data-required={rootProps["data-required"]}
      data-invalid={rootProps["data-invalid"]}
    >
      <input
        {...inputProps}
        ref={mergedInputRef}
        aria-hidden
        tabIndex={-1}
        style={visuallyHiddenStyle}
        data-state={rootProps["data-state"]}
      />
      <div
        {...mergedRootProps}
        className={mergeClassNames("ara-switch__track", trackClassName)}
        style={trackStyle}
      >
        <span
          aria-hidden
          className={mergeClassNames("ara-switch__thumb", thumbClassName)}
          style={thumbStyle}
        />
      </div>
      {(label || description) && (
        <div className="ara-switch__text" style={{ color: labelColor }}>
          {label ? (
            <label
              {...labelProps}
              className="ara-switch__label"
              style={{ color: labelColor, fontWeight: 600 }}
            >
              {label}
            </label>
          ) : null}
          {description ? (
            <div
              {...descriptionProps}
              className="ara-switch__description"
              style={{ color: labelColor, opacity: isDisabled ? 0.8 : 0.95 }}
            >
              {description}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
});
