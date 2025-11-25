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
  Pick<
    InputHTMLAttributes<HTMLInputElement>,
    "id" | "name" | "value" | "checked" | "defaultChecked" | "required" | "disabled" | "readOnly"
  > &
  Pick<HTMLAttributes<HTMLDivElement>, "className" | "style" | "onClick" | "onKeyDown">;

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
      style={style}
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
      >
        <span aria-hidden className="ara-checkbox__indicator" data-indeterminate={isIndeterminate || undefined} />
      </div>
      {(label || description) && (
        <div className="ara-checkbox__text">
          {label ? (
            <label {...labelProps} className="ara-checkbox__label">
              {label}
            </label>
          ) : null}
          {description ? (
            <div {...descriptionProps} className="ara-checkbox__description">
              {description}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
});
