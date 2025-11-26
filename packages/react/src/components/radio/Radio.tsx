import {
  forwardRef,
  useMemo,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type CSSProperties,
  type ReactNode,
  type Ref
} from "react";
import { composeRefs } from "@radix-ui/react-compose-refs";
import { useRadio, type RadioInputProps } from "@ara/core";
import { useRadioGroupContext } from "./RadioGroup.js";
import { createFormControlStyleTokens } from "../form-control/formControlStyle.js";
import { useAraTheme } from "../../theme/index.js";

function mergeClassNames(...values: Array<string | undefined | null | false>): string {
  return values.filter(Boolean).join(" ");
}

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

interface RadioOwnProps {
  readonly label?: ReactNode;
  readonly description?: ReactNode;
  readonly layout?: "inline" | "stacked";
  readonly inputRef?: Ref<HTMLInputElement>;
  readonly describedBy?: string | readonly string[];
  readonly labelledBy?: string | readonly string[];
  readonly controlClassName?: string;
}

export type RadioProps = RadioOwnProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, "checked" | "defaultChecked" | "type" | "name"> &
  Pick<HTMLAttributes<HTMLDivElement>, "className" | "style" | "onClick" | "onKeyDown"> & {
    readonly value: string;
  };

export const Radio = forwardRef<HTMLDivElement, RadioProps>(function Radio(props, ref) {
  const {
    id,
    value,
    disabled,
    readOnly,
    layout = "inline",
    label,
    description,
    inputRef: inputRefProp,
    describedBy,
    labelledBy,
    className,
    style,
    controlClassName,
    onChange,
    onClick,
    onKeyDown,
    ...restProps
  } = props;

  const group = useRadioGroupContext();
  const theme = useAraTheme();
  const tokens = useMemo(() => createFormControlStyleTokens(theme), [theme]);

  const describedByIds = useMemo(() => {
    const ids: string[] = [];
    const groupDescribedBy = group.rootProps["aria-describedby"];

    if (groupDescribedBy) {
      ids.push(...groupDescribedBy.split(" ").filter(Boolean));
    }

    if (describedBy) {
      ids.push(...(Array.isArray(describedBy) ? describedBy : [describedBy]));
    }

    return ids;
  }, [describedBy, group.rootProps]);

  const labelledByIds = useMemo(() => {
    if (!labelledBy) return [] as string[];
    return Array.isArray(labelledBy) ? [...labelledBy] : [labelledBy];
  }, [labelledBy]);

  const { rootProps, inputProps, labelProps, descriptionProps } = useRadio({
    id,
    value,
    disabled,
    readOnly,
    hasLabel: Boolean(label),
    hasDescription: Boolean(description),
    describedByIds,
    labelledByIds,
    group
  });

  const isDisabled = Boolean(rootProps["data-disabled"]);
  const isInvalid = Boolean(rootProps["data-invalid"]);
  const isChecked = rootProps["data-state"] === "checked";
  const isStacked = layout === "stacked";
  const hasText = Boolean(label || description);

  const labelColor = isDisabled
    ? tokens.labelColor.disabled
    : isInvalid
      ? tokens.labelColor.invalid
      : tokens.labelColor.default;
  const descriptionColor = isDisabled
    ? tokens.labelColor.disabled
    : isInvalid
      ? tokens.labelColor.invalid
      : "var(--ara-radio-description, #6b7280)";
  const descriptionFontSize = `var(--ara-radio-description-size, calc(${tokens.fontSize} * 0.92))`;
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
  const controlBorder = isDisabled
    ? tokens.borderColor.disabled
    : isInvalid
      ? tokens.borderColor.invalid
      : isChecked
        ? indicatorColor
        : tokens.borderColor.default;

  const rootStyle: CSSProperties = {
    display: "inline-flex",
    flexDirection: isStacked ? "column" : "row",
    alignItems: isStacked ? "stretch" : "flex-start",
    gap: tokens.gap,
    fontSize: tokens.fontSize,
    lineHeight: tokens.lineHeight,
    color: labelColor,
    cursor: isDisabled ? "not-allowed" : "pointer",
    userSelect: "none",
    opacity: isDisabled ? tokens.disabledOpacity : 1
  };

  const controlStyle: CSSProperties = {
    width: tokens.controlSize,
    height: tokens.controlSize,
    borderRadius: "999px",
    borderWidth: tokens.borderWidth,
    borderStyle: "solid",
    backgroundColor: controlBackground,
    borderColor: controlBorder,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    alignSelf: isStacked ? "flex-start" : undefined,
    transition: "background-color 120ms ease, border-color 120ms ease"
  };

  const indicatorStyle: CSSProperties = {
    width: "55%",
    height: "55%",
    borderRadius: "999px",
    backgroundColor: indicatorColor,
    transform: isChecked ? "scale(1)" : "scale(0)",
    transition: "transform 120ms ease"
  };

  const mergedRootProps = useMemo(
    () => ({
      ...rootProps,
      onClick: composeEventHandlers(rootProps.onClick, onClick),
      onKeyDown: composeEventHandlers(rootProps.onKeyDown, onKeyDown)
    }),
    [onClick, onKeyDown, rootProps]
  );

  const { ref: inputPropsRef, onChange: inputOnChange, ...inputPropsWithoutRef } =
    inputProps as RadioInputProps & { ref?: Ref<HTMLInputElement> };

  const mergedInputProps = {
    ...inputPropsWithoutRef,
    onChange: composeEventHandlers(inputOnChange, onChange),
    ref: composeRefs(inputPropsRef, inputRefProp)
  };

  const textContent =
    hasText && (
      <div
        className="ara-radio__text"
        style={{
          color: labelColor,
          display: "flex",
          flexDirection: "column",
          gap: "0.2em"
        }}
      >
        {label ? (
          <label
            {...labelProps}
            className="ara-radio__label"
            style={{ color: labelColor, fontWeight: 600 }}
          >
            {label}
          </label>
        ) : null}
        {description ? (
          <div
            {...descriptionProps}
            className="ara-radio__description"
            style={{
              color: descriptionColor,
              fontSize: descriptionFontSize,
              lineHeight: tokens.lineHeight,
              fontWeight: 500
            }}
          >
            {description}
          </div>
        ) : null}
      </div>
    );

  return (
    <div
      {...restProps}
      ref={ref}
      className={mergeClassNames("ara-radio", className)}
      style={{ ...rootStyle, ...style }}
      data-state={rootProps["data-state"]}
      data-disabled={rootProps["data-disabled"]}
      data-readonly={rootProps["data-readonly"]}
    >
      <input
        {...mergedInputProps}
        aria-hidden
        tabIndex={-1}
        style={visuallyHiddenStyle}
      />
      {isStacked ? textContent : null}
      <div
        {...mergedRootProps}
        className={mergeClassNames("ara-radio__control", controlClassName)}
        data-state={rootProps["data-state"]}
        data-disabled={rootProps["data-disabled"]}
        data-readonly={rootProps["data-readonly"]}
        style={controlStyle}
      >
        <span aria-hidden className="ara-radio__indicator" style={indicatorStyle} />
      </div>
      {!isStacked ? textContent : null}
    </div>
  );
});
