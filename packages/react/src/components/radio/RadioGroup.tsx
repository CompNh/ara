import {
  createContext,
  forwardRef,
  useContext,
  useMemo,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode
} from "react";
import { useRadioGroup, type UseRadioGroupResult } from "@ara/core";
import type { RadioGroupOrientation } from "@ara/core";
import { createFormControlStyleTokens } from "../form-control/formControlStyle.js";
import { useAraTheme } from "../../theme/index.js";

export type { RadioGroupOrientation } from "@ara/core";

function mergeClassNames(...values: Array<string | undefined | null | false>): string {
  return values.filter(Boolean).join(" ");
}

interface RadioGroupContextValue {
  readonly group: UseRadioGroupResult;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export function useRadioGroupContext(): UseRadioGroupResult {
  const context = useContext(RadioGroupContext);

  if (!context) {
    throw new Error("Radio 컴포넌트는 RadioGroup 내부에서만 사용할 수 있습니다.");
  }

  return context.group;
}

interface RadioGroupOwnProps {
  readonly children: ReactNode;
  readonly label?: ReactNode;
  readonly description?: ReactNode;
  readonly loop?: boolean;
  readonly orientation?: RadioGroupOrientation;
  readonly describedBy?: string | readonly string[];
  readonly labelledBy?: string | readonly string[];
  readonly onValueChange?: (value: string) => void;
}

export type RadioGroupProps = RadioGroupOwnProps &
  Pick<
    HTMLAttributes<HTMLDivElement>,
    "id" | "className" | "style" | "role" | "aria-labelledby" | "aria-describedby"
  > & {
    readonly name?: string;
    readonly value?: string;
    readonly defaultValue?: string;
    readonly disabled?: boolean;
    readonly readOnly?: boolean;
    readonly required?: boolean;
    readonly invalid?: boolean;
  };

export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(function RadioGroup(
  props,
  ref
) {
  const {
    id,
    children,
    label,
    description,
    name,
    value,
    defaultValue,
    disabled,
    readOnly,
    required,
    invalid,
    orientation,
    loop,
    describedBy,
    labelledBy,
    className,
    style,
    onValueChange,
    ...restProps
  } = props;

  const describedByIds = useMemo(() => {
    if (!describedBy) return [] as string[];
    return Array.isArray(describedBy) ? [...describedBy] : [describedBy];
  }, [describedBy]);

  const labelledByIds = useMemo(() => {
    if (!labelledBy) return [] as string[];
    return Array.isArray(labelledBy) ? [...labelledBy] : [labelledBy];
  }, [labelledBy]);

  const group = useRadioGroup({
    id,
    name,
    value,
    defaultValue,
    disabled,
    readOnly,
    required,
    invalid,
    orientation,
    loop,
    hasLabel: Boolean(label),
    hasDescription: Boolean(description),
    describedByIds,
    labelledByIds,
    onValueChange
  });

  const { rootProps, labelProps, descriptionProps, loop: groupLoop, orientation: groupOrientation } =
    group;
  const theme = useAraTheme();
  const tokens = useMemo(() => createFormControlStyleTokens(theme), [theme]);

  const labelColor = group.isDisabled
    ? tokens.labelColor.disabled
    : group.invalid
      ? tokens.labelColor.invalid
      : tokens.labelColor.default;

  const requiredIndicatorColor = group.isDisabled
    ? tokens.labelColor.disabled
    : "var(--ara-radio-group-required, #d93025)";

  const rootStyle = {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.3em",
    color: labelColor
  };

  const itemsStyle: CSSProperties = {
    display: "flex",
    flexDirection: groupOrientation === "vertical" ? "column" : "row",
    gap: tokens.gap,
    flexWrap: "wrap" as const
  };

  return (
    <RadioGroupContext.Provider value={{ group }}>
      <div
        {...rootProps}
        {...restProps}
        ref={ref}
        className={mergeClassNames("ara-radio-group", className)}
        style={{ ...rootStyle, ...style }}
        data-disabled={rootProps["data-disabled"]}
        data-readonly={rootProps["data-readonly"]}
        data-orientation={groupOrientation}
        data-loop={groupLoop}
      >
        {label ? (
          <label
            {...labelProps}
            className="ara-radio-group__label"
            style={{
              color: labelColor,
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: "0.25em"
            }}
          >
            {label}
            {group.required ? (
              <span
                aria-hidden
                className="ara-radio-group__required"
                data-testid="radio-group-required-indicator"
                style={{
                  color: requiredIndicatorColor,
                  fontSize: "0.95em",
                  fontWeight: 700,
                  lineHeight: 1
                }}
              >
                *
              </span>
            ) : null}
          </label>
        ) : null}
        {description ? (
          <div
            {...descriptionProps}
            className="ara-radio-group__description"
            style={{
              color: "var(--ara-radio-group-description, #6b7280)",
              fontSize: `var(--ara-radio-group-description-size, calc(${tokens.fontSize} * 0.92))`,
              lineHeight: tokens.lineHeight,
              fontWeight: 500
            }}
          >
            {description}
          </div>
        ) : null}
        <div className="ara-radio-group__items" style={itemsStyle}>
          {children}
        </div>
      </div>
    </RadioGroupContext.Provider>
  );
});
