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

export type CheckboxState = boolean | "indeterminate";
export type CheckboxAriaState = boolean | "mixed";
export type CheckboxDataState = "checked" | "unchecked" | "indeterminate";

export interface UseCheckboxOptions {
  readonly id?: string;
  readonly name?: string;
  readonly value?: string;
  readonly checked?: CheckboxState;
  readonly defaultChecked?: CheckboxState;
  readonly required?: boolean;
  readonly disabled?: boolean;
  readonly readOnly?: boolean;
  readonly invalid?: boolean;
  readonly hasLabel?: boolean;
  readonly hasDescription?: boolean;
  readonly describedByIds?: readonly string[];
  readonly labelledByIds?: readonly string[];
  readonly onCheckedChange?: (checked: CheckboxState) => void;
}

interface UseCheckboxIds {
  readonly inputId: string;
  readonly labelId: string;
  readonly descriptionId: string;
}

export interface UseCheckboxResult {
  readonly rootProps: CheckboxRootProps;
  readonly inputProps: CheckboxInputProps;
  readonly labelProps: CheckboxLabelProps;
  readonly descriptionProps: CheckboxDescriptionProps;
  readonly checkedState: CheckboxState;
  readonly isChecked: boolean;
  readonly isIndeterminate: boolean;
}

export interface CheckboxRootProps {
  readonly role: "checkbox";
  readonly tabIndex: number;
  readonly "aria-checked": CheckboxAriaState;
  readonly "aria-labelledby"?: string;
  readonly "aria-describedby"?: string;
  readonly "aria-required"?: true;
  readonly "aria-invalid"?: true;
  readonly "aria-readonly"?: true;
  readonly "aria-disabled"?: true;
  readonly "data-state": CheckboxDataState;
  readonly "data-disabled"?: true;
  readonly "data-readonly"?: true;
  readonly "data-required"?: true;
  readonly "data-invalid"?: true;
  readonly onClick: (event: MouseEvent<HTMLElement>) => void;
  readonly onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
}

export interface CheckboxInputProps {
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

export interface CheckboxLabelProps {
  readonly id: string;
  readonly htmlFor: string;
}

export interface CheckboxDescriptionProps {
  readonly id: string;
}

export function useCheckbox(options: UseCheckboxOptions = {}): UseCheckboxResult {
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
  const ids = useMemo<UseCheckboxIds>(() => {
    const inputId = id ?? `ara-checkbox-${generatedId}`;
    return {
      inputId,
      labelId: `${inputId}-label`,
      descriptionId: `${inputId}-description`
    };
  }, [generatedId, id]);

  const appliedReadOnly = !disabled && readOnly;
  const isControlled = checked !== undefined;
  const [uncontrolledState, setUncontrolledState] = useState<CheckboxState>(defaultChecked);
  const currentState = isControlled ? checked ?? false : uncontrolledState;
  const stateRef = useRef<CheckboxState>(currentState);
  const initialDefaultStateRef = useRef<CheckboxState>(defaultChecked);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const dataState: CheckboxDataState = useMemo(() => {
    if (currentState === "indeterminate") return "indeterminate";
    return currentState ? "checked" : "unchecked";
  }, [currentState]);

  const ariaChecked: CheckboxAriaState = useMemo(() => {
    if (currentState === "indeterminate") return "mixed";
    return currentState;
  }, [currentState]);

  const setCheckedState = useCallback(
    (next: CheckboxState) => {
      stateRef.current = next;
      if (!isControlled) {
        setUncontrolledState(next);
      }
      onCheckedChange?.(next);
    },
    [isControlled, onCheckedChange]
  );

  const resetToDefault = useCallback(() => {
    if (isControlled) return;
    setCheckedState(initialDefaultStateRef.current);
  }, [isControlled, setCheckedState]);

  const toggleState = useCallback(() => {
    if (disabled || appliedReadOnly) return;
    const nextState = stateRef.current === "indeterminate" ? true : !stateRef.current;
    setCheckedState(nextState);
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
      inputRef.current.indeterminate = currentState === "indeterminate";
    }
  }, [currentState]);

  useEffect(() => {
    const node = inputRef.current;
    const form = node?.form;
    if (!form) return;

    const handleReset = () => {
      resetToDefault();
    };

    form.addEventListener("reset", handleReset);
    return () => {
      form.removeEventListener("reset", handleReset);
    };
  }, [resetToDefault]);

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

  const rootProps: CheckboxRootProps = {
    role: "checkbox",
    tabIndex: disabled ? -1 : 0,
    "aria-checked": ariaChecked,
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

  const inputProps: CheckboxInputProps = {
    id: ids.inputId,
    name,
    value,
    type: "checkbox",
    required: required || undefined,
    disabled: disabled || undefined,
    readOnly: appliedReadOnly || undefined,
    checked: currentState === true,
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

  const labelProps: CheckboxLabelProps = {
    id: ids.labelId,
    htmlFor: ids.inputId
  };

  const descriptionProps: CheckboxDescriptionProps = {
    id: ids.descriptionId
  };

  return {
    rootProps,
    inputProps,
    labelProps,
    descriptionProps,
    checkedState: currentState,
    isChecked: currentState === true,
    isIndeterminate: currentState === "indeterminate"
  };
}
