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
import { useCheckbox, type CheckboxState } from "@ara/core";
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

interface CheckboxOwnProps {
  readonly label?: ReactNode;
  readonly description?: ReactNode;
  readonly invalid?: boolean;
  readonly inputRef?: Ref<HTMLInputElement>;
  readonly describedBy?: string | readonly string[];
  readonly labelledBy?: string | readonly string[];
  readonly controlClassName?: string;
  readonly onCheckedChange?: (state: CheckboxState) => void;
}

export type CheckboxProps = CheckboxOwnProps &
  Omit<
    Pick<
      InputHTMLAttributes<HTMLInputElement>,
      "id" | "name" | "checked" | "defaultChecked" | "required" | "disabled" | "readOnly"
    >,
    "checked" | "defaultChecked"
  > &
  Pick<HTMLAttributes<HTMLDivElement>, "className" | "style" | "onClick" | "onKeyDown"> & {
    readonly checked?: CheckboxState;
    readonly defaultChecked?: CheckboxState;
    readonly value?: string;
  };

export const Checkbox = forwardRef<HTMLDivElement, CheckboxProps>(function Checkbox(props, ref) {
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
    controlClassName,
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

  const { rootProps, inputProps, labelProps, descriptionProps, isIndeterminate } = useCheckbox({
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
  const labelColor = isDisabled
    ? tokens.labelColor.disabled
    : isInvalid
      ? tokens.labelColor.invalid
      : tokens.labelColor.default;

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

  const controlSurface = isDisabled
    ? tokens.controlColor.disabled
    : "var(--ara-checkbox-surface, #f7f8fa)";
  const controlBorderColor = isDisabled
    ? tokens.borderColor.disabled
    : isInvalid
      ? tokens.borderColor.invalid
      : "var(--ara-checkbox-border, #d6dae2)";
  const indicatorFill = isDisabled
    ? tokens.indicatorColor.disabled
    : isInvalid
      ? tokens.indicatorColor.invalid
      : "var(--ara-checkbox-indicator, #1f2333)";

  const controlStyle: CSSProperties = {
    width: tokens.controlSize,
    height: tokens.controlSize,
    borderRadius: tokens.radius,
    borderWidth: tokens.borderWidth,
    borderStyle: "solid",
    backgroundColor: controlSurface,
    borderColor: controlBorderColor,
    boxShadow: "var(--ara-checkbox-shadow, 0 2px 6px rgba(22, 28, 45, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.75))",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "background-color 120ms ease, border-color 120ms ease, box-shadow 120ms ease"
  };

  const indicatorContainer: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    transition: "transform 120ms ease"
  };

  const indeterminateBar: CSSProperties = {
    width: "60%",
    height: "2px",
    borderRadius: "999px",
    backgroundColor: indicatorFill,
    transform: isIndeterminate ? "scaleX(1)" : "scaleX(0)",
    transition: "transform 120ms ease"
  };

  const checkmarkIcon: CSSProperties = {
    width: "64%",
    height: "64%",
    transformOrigin: "center",
    transform: rootProps["data-state"] === "checked" ? "scale(1)" : "scale(0.65)",
    opacity: rootProps["data-state"] === "checked" ? 1 : 0,
    transition: "transform 120ms ease, opacity 120ms ease"
  };

  const mergedRootProps = useMemo(
    () => ({
      ...rootProps,
      onClick: composeEventHandlers(rootProps.onClick, onClick),
      onKeyDown: composeEventHandlers(rootProps.onKeyDown, onKeyDown)
    }),
    [rootProps, onClick, onKeyDown]
  );

  const mergedInputRef = composeRefs(inputProps.ref, inputRef);

  return (
    <div
      {...restProps}
      ref={ref}
      className={mergeClassNames("ara-checkbox", className)}
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
        style={visuallyHiddenStyle}
        aria-hidden
        tabIndex={-1}
        data-state={rootProps["data-state"]}
      />
      <div
        {...mergedRootProps}
        className={mergeClassNames("ara-checkbox__control", controlClassName)}
        style={controlStyle}
      >
        <span
          aria-hidden
          className="ara-checkbox__indicator"
          data-indeterminate={isIndeterminate || undefined}
          style={indicatorContainer}
        >
          {isIndeterminate ? (
            <span style={indeterminateBar} />
          ) : (
            <svg
              viewBox="0 0 16 16"
              role="presentation"
              focusable={false}
              style={checkmarkIcon}
            >
              <polyline
                points="3.5 8.5 6.5 12 12.5 4.5"
                fill="none"
                stroke={indicatorFill}
                strokeWidth={1.75}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
      </div>
      {(label || description) && (
        <div className="ara-checkbox__text" style={{ color: labelColor }}>
          {label ? (
            <label
              {...labelProps}
              className="ara-checkbox__label"
              style={{ color: labelColor, fontWeight: 600 }}
            >
              {label}
            </label>
          ) : null}
          {description ? (
            <div
              {...descriptionProps}
              className="ara-checkbox__description"
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
