import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type MouseEvent
} from "react";

export type SwitchDataState = "checked" | "unchecked";

export interface UseSwitchOptions {
  readonly id?: string;
  readonly name?: string;
  readonly value?: string;
  readonly checked?: boolean;
  readonly defaultChecked?: boolean;
  readonly required?: boolean;
  readonly disabled?: boolean;
  readonly readOnly?: boolean;
  readonly invalid?: boolean;
  readonly hasLabel?: boolean;
  readonly hasDescription?: boolean;
  readonly describedByIds?: readonly string[];
  readonly labelledByIds?: readonly string[];
  readonly onCheckedChange?: (checked: boolean) => void;
}

interface UseSwitchIds {
  readonly inputId: string;
  readonly labelId: string;
  readonly descriptionId: string;
}

export interface UseSwitchResult {
  readonly rootProps: SwitchRootProps;
  readonly inputProps: SwitchInputProps;
  readonly labelProps: SwitchLabelProps;
  readonly descriptionProps: SwitchDescriptionProps;
  readonly isChecked: boolean;
}

export interface SwitchRootProps {
  readonly role: "switch";
  readonly tabIndex: number;
  readonly "aria-checked": boolean;
  readonly "aria-labelledby"?: string;
  readonly "aria-describedby"?: string;
  readonly "aria-required"?: true;
  readonly "aria-invalid"?: true;
  readonly "aria-readonly"?: true;
  readonly "aria-disabled"?: true;
  readonly "data-state": SwitchDataState;
  readonly "data-disabled"?: true;
  readonly "data-readonly"?: true;
  readonly "data-required"?: true;
  readonly "data-invalid"?: true;
  readonly onClick: (event: MouseEvent<HTMLElement>) => void;
  readonly onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
}

export interface SwitchInputProps {
  readonly id: string;
  readonly name?: string;
  readonly value: string;
  readonly type: "checkbox";
  readonly required?: boolean;
  readonly disabled?: boolean;
  readonly readOnly?: boolean;
  readonly checked: boolean;
  readonly ref: (node: HTMLInputElement | null) => void;
  readonly "aria-invalid"?: true;
  readonly "aria-required"?: true;
  readonly "aria-readonly"?: true;
  readonly "aria-disabled"?: true;
  readonly "aria-describedby"?: string;
  readonly "aria-labelledby"?: string;
  readonly onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export interface SwitchLabelProps {
  readonly id: string;
  readonly htmlFor: string;
}

export interface SwitchDescriptionProps {
  readonly id: string;
}

export function useSwitch(options: UseSwitchOptions = {}): UseSwitchResult {
  const {
    id,
    name,
    value = "on",
    checked,
    defaultChecked = false,
    required = false,
    disabled = false,
    readOnly = false,
    invalid = false,
    hasLabel = true,
    hasDescription = false,
    describedByIds = [],
    labelledByIds = [],
    onCheckedChange
  } = options;

  const generatedId = useId();
  const ids = useMemo<UseSwitchIds>(() => {
    const inputId = id ?? `ara-switch-${generatedId}`;
    return {
      inputId,
      labelId: `${inputId}-label`,
      descriptionId: `${inputId}-description`
    };
  }, [generatedId, id]);

  const appliedReadOnly = !disabled && readOnly;
  const isControlled = checked !== undefined;
  const [uncontrolledState, setUncontrolledState] = useState(defaultChecked);
  const currentState = isControlled ? checked ?? false : uncontrolledState;
  const stateRef = useRef(currentState);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const dataState: SwitchDataState = currentState ? "checked" : "unchecked";

  const setCheckedState = useCallback(
    (next: boolean) => {
      stateRef.current = next;
      if (!isControlled) {
        setUncontrolledState(next);
      }
      onCheckedChange?.(next);
    },
    [isControlled, onCheckedChange]
  );

  const toggleState = useCallback(() => {
    if (disabled || appliedReadOnly) return;
    setCheckedState(!stateRef.current);
  }, [appliedReadOnly, disabled, setCheckedState]);

  const handleClick = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      if (event.defaultPrevented) return;
      event.preventDefault();
      toggleState();
    },
    [toggleState]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (event.defaultPrevented) return;
      if (event.key === " " || event.key === "Spacebar" || event.key === "Enter") {
        event.preventDefault();
        toggleState();
      }
    },
    [toggleState]
  );

  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      event.stopPropagation();
      toggleState();
    },
    [toggleState]
  );

  useEffect(() => {
    stateRef.current = currentState;
  }, [currentState]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.checked = currentState;
    }
  }, [currentState]);

  const ariaDescribedBy = useMemo(() => {
    const idsToApply: string[] = [];

    if (hasDescription) idsToApply.push(ids.descriptionId);
    if (describedByIds.length > 0) {
      for (const describedById of describedByIds) {
        if (describedById) idsToApply.push(describedById);
      }
    }

    return idsToApply.length > 0 ? idsToApply.join(" ") : undefined;
  }, [describedByIds, hasDescription, ids.descriptionId]);

  const ariaLabelledBy = useMemo(() => {
    const idsToApply: string[] = [];

    if (hasLabel) idsToApply.push(ids.labelId);
    if (labelledByIds.length > 0) {
      for (const labelledById of labelledByIds) {
        if (labelledById) idsToApply.push(labelledById);
      }
    }

    return idsToApply.length > 0 ? idsToApply.join(" ") : undefined;
  }, [hasLabel, labelledByIds, ids.labelId]);

  const rootProps: SwitchRootProps = {
    role: "switch",
    tabIndex: disabled ? -1 : 0,
    "aria-checked": currentState,
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy,
    "aria-required": required ? true : undefined,
    "aria-invalid": invalid ? true : undefined,
    "aria-readonly": appliedReadOnly ? true : undefined,
    "aria-disabled": disabled ? true : undefined,
    "data-state": dataState,
    "data-disabled": disabled ? true : undefined,
    "data-readonly": appliedReadOnly ? true : undefined,
    "data-required": required ? true : undefined,
    "data-invalid": invalid ? true : undefined,
    onClick: handleClick,
    onKeyDown: handleKeyDown
  };

  const inputProps: SwitchInputProps = {
    id: ids.inputId,
    name,
    value,
    type: "checkbox",
    required: required || undefined,
    disabled: disabled || undefined,
    readOnly: appliedReadOnly || undefined,
    checked: currentState,
    ref: (node) => {
      inputRef.current = node;
    },
    "aria-invalid": invalid ? true : undefined,
    "aria-required": required ? true : undefined,
    "aria-readonly": appliedReadOnly ? true : undefined,
    "aria-disabled": disabled ? true : undefined,
    "aria-describedby": ariaDescribedBy,
    "aria-labelledby": ariaLabelledBy,
    onChange: handleInputChange
  };

  const labelProps: SwitchLabelProps = {
    id: ids.labelId,
    htmlFor: ids.inputId
  };

  const descriptionProps: SwitchDescriptionProps = {
    id: ids.descriptionId
  };

  return {
    rootProps,
    inputProps,
    labelProps,
    descriptionProps,
    isChecked: currentState
  };
}
