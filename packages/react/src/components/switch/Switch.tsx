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
    labelledByIds
  });

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
        aria-hidden
        tabIndex={-1}
        style={visuallyHiddenStyle}
        data-state={rootProps["data-state"]}
      />
      <div {...mergedRootProps} className={mergeClassNames("ara-switch__track", trackClassName)}>
        <span aria-hidden className={mergeClassNames("ara-switch__thumb", thumbClassName)} />
      </div>
      {(label || description) && (
        <div className="ara-switch__text">
          {label ? (
            <label {...labelProps} className="ara-switch__label">
              {label}
            </label>
          ) : null}
          {description ? (
            <div {...descriptionProps} className="ara-switch__description">
              {description}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
});
