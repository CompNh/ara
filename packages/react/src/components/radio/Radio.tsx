import {
  forwardRef,
  useMemo,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type CSSProperties,
  type ReactNode,
  type Ref
} from "react";
import { useRadio } from "@ara/core";
import { useRadioGroupContext } from "./RadioGroup.js";

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
    label,
    description,
    inputRef,
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

  const mergedRootProps = useMemo(
    () => ({
      ...rootProps,
      onClick: composeEventHandlers(rootProps.onClick, onClick),
      onKeyDown: composeEventHandlers(rootProps.onKeyDown, onKeyDown)
    }),
    [onClick, onKeyDown, rootProps]
  );

  const mergedInputProps = useMemo(
    () => ({
      ...inputProps,
      onChange: composeEventHandlers(inputProps.onChange, onChange)
    }),
    [inputProps, onChange]
  );

  return (
    <div
      {...restProps}
      ref={ref}
      className={mergeClassNames("ara-radio", className)}
      style={style}
      data-state={rootProps["data-state"]}
      data-disabled={rootProps["data-disabled"]}
      data-readonly={rootProps["data-readonly"]}
    >
      <input
        {...mergedInputProps}
        ref={inputRef}
        aria-hidden
        tabIndex={-1}
        style={visuallyHiddenStyle}
      />
      <div
        {...mergedRootProps}
        className={mergeClassNames("ara-radio__control", controlClassName)}
        data-state={rootProps["data-state"]}
        data-disabled={rootProps["data-disabled"]}
        data-readonly={rootProps["data-readonly"]}
      >
        <span aria-hidden className="ara-radio__indicator" />
      </div>
      {(label || description) && (
        <div className="ara-radio__text">
          {label ? (
            <label {...labelProps} className="ara-radio__label">
              {label}
            </label>
          ) : null}
          {description ? (
            <div {...descriptionProps} className="ara-radio__description">
              {description}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
});
