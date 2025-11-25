import {
  createContext,
  forwardRef,
  useContext,
  useMemo,
  type HTMLAttributes,
  type ReactNode
} from "react";
import { useRadioGroup, type UseRadioGroupResult } from "@ara/core";
import type { RadioGroupOrientation } from "@ara/core";

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

  return (
    <RadioGroupContext.Provider value={{ group }}>
      <div
        {...rootProps}
        {...restProps}
        ref={ref}
        className={mergeClassNames("ara-radio-group", className)}
        style={style}
        data-disabled={rootProps["data-disabled"]}
        data-readonly={rootProps["data-readonly"]}
        data-orientation={groupOrientation}
        data-loop={groupLoop}
      >
        {label ? (
          <label {...labelProps} className="ara-radio-group__label">
            {label}
          </label>
        ) : null}
        {description ? (
          <div {...descriptionProps} className="ara-radio-group__description">
            {description}
          </div>
        ) : null}
        <div className="ara-radio-group__items">{children}</div>
      </div>
    </RadioGroupContext.Provider>
  );
});
