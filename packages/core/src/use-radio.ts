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
import { type UseRadioGroupResult } from "./use-radio-group.js";

export type RadioDataState = "checked" | "unchecked";

export interface UseRadioOptions {
  readonly id?: string;
  readonly value: string;
  readonly disabled?: boolean;
  readonly readOnly?: boolean;
  readonly hasLabel?: boolean;
  readonly hasDescription?: boolean;
  readonly describedByIds?: readonly string[];
  readonly labelledByIds?: readonly string[];
  readonly group: UseRadioGroupResult;
}

interface UseRadioIds {
  readonly inputId: string;
  readonly labelId: string;
  readonly descriptionId: string;
}

export interface UseRadioResult {
  readonly rootProps: RadioRootProps;
  readonly inputProps: RadioInputProps;
  readonly inputRef: (node: HTMLInputElement | null) => void;
  readonly labelProps: RadioLabelProps;
  readonly descriptionProps: RadioDescriptionProps;
  readonly isChecked: boolean;
}

export interface RadioRootProps {
  readonly id: string;
  readonly role: "radio";
  readonly tabIndex: number;
  readonly "aria-checked": boolean;
  readonly "aria-labelledby"?: string;
  readonly "aria-describedby"?: string;
  readonly "aria-required"?: true;
  readonly "aria-invalid"?: true;
  readonly "aria-disabled"?: true;
  readonly "aria-readonly"?: true;
  readonly "data-state": RadioDataState;
  readonly "data-disabled"?: true;
  readonly "data-readonly"?: true;
  readonly "data-required"?: true;
  readonly "data-invalid"?: true;
  readonly onClick: (event: MouseEvent<HTMLElement>) => void;
  readonly onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  readonly ref: (node: HTMLElement | null) => void;
}

export interface RadioInputProps {
  readonly id: string;
  readonly name?: string;
  readonly value: string;
  readonly type: "radio";
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

export interface RadioLabelProps {
  readonly id: string;
  readonly htmlFor: string;
}

export interface RadioDescriptionProps {
  readonly id: string;
}

export function useRadio(options: UseRadioOptions): UseRadioResult {
  const {
    id,
    value,
    disabled = false,
    readOnly = false,
    hasLabel = true,
    hasDescription = false,
    describedByIds = [],
    labelledByIds = [],
    group
  } = options;

  const generatedId = useId();
  const ids = useMemo<UseRadioIds>(() => {
    const inputId = id ?? `ara-radio-${generatedId}`;
    return {
      inputId,
      labelId: `${inputId}-label`,
      descriptionId: `${inputId}-description`
    };
  }, [generatedId, id]);

  const {
    handleArrowNavigation,
    invalid: groupInvalid,
    isDisabled: groupDisabled,
    isReadOnly: groupReadOnly,
    resetToDefault,
    name: groupName,
    registerItem,
    required: groupRequired,
    setValue: setGroupValue,
    updateTabStops,
    value: groupValue
  } = group;

  const appliedReadOnly = (groupReadOnly || readOnly) && !groupDisabled;
  const isDisabled = groupDisabled || disabled;
  const isChecked = groupValue === value;
  const [tabIndex, setTabIndex] = useState(-1);
  const rootRef = useRef<HTMLElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const setInputRef = useCallback((node: HTMLInputElement | null) => {
    inputRef.current = node;
  }, []);

  const controller = useMemo(
    () => ({
      value,
      isDisabled: () => isDisabled,
      setTabIndex: (nextTabIndex: number) => {
        setTabIndex(nextTabIndex);
      },
      focus: () => {
        const node = rootRef.current;
        if (node) node.focus();
      }
    }),
    [isDisabled, value]
  );

  useEffect(() => {
    const unregister = registerItem(controller);
    return () => unregister();
  }, [controller, registerItem]);

  useEffect(() => {
    updateTabStops();
  }, [isDisabled, isChecked, updateTabStops]);

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

  const setChecked = useCallback(() => {
    if (isDisabled || appliedReadOnly) return;
    setGroupValue(value);
  }, [appliedReadOnly, isDisabled, setGroupValue, value]);

  const handleClick = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      if (event.defaultPrevented) return;
      event.preventDefault();
      setChecked();
    },
    [setChecked]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (event.defaultPrevented) return;
      if (isDisabled || appliedReadOnly) return;

      if (event.key === " " || event.key === "Spacebar") {
        event.preventDefault();
        setChecked();
      } else if (
        event.key === "ArrowRight" ||
        event.key === "ArrowLeft" ||
        event.key === "ArrowUp" ||
        event.key === "ArrowDown"
      ) {
        event.preventDefault();
        handleArrowNavigation(value, event.key);
      }
    },
    [appliedReadOnly, handleArrowNavigation, isDisabled, setChecked, value]
  );

  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      event.stopPropagation();
      setChecked();
    },
    [setChecked]
  );

  const rootProps: RadioRootProps = {
    id: ids.inputId,
    role: "radio",
    tabIndex: isDisabled ? -1 : tabIndex,
    "aria-checked": isChecked,
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy,
    "aria-required": groupRequired ? true : undefined,
    "aria-invalid": groupInvalid ? true : undefined,
    "aria-disabled": isDisabled ? true : undefined,
    "aria-readonly": appliedReadOnly ? true : undefined,
    "data-state": isChecked ? "checked" : "unchecked",
    "data-disabled": isDisabled ? true : undefined,
    "data-readonly": appliedReadOnly ? true : undefined,
    "data-required": groupRequired ? true : undefined,
    "data-invalid": groupInvalid ? true : undefined,
    onClick: handleClick,
    onKeyDown: handleKeyDown,
    ref: (node) => {
      rootRef.current = node;
    }
  };

  const inputProps: RadioInputProps = {
    id: ids.inputId,
    name: groupName,
    value,
    type: "radio",
    required: groupRequired || undefined,
    disabled: isDisabled || undefined,
    readOnly: appliedReadOnly || undefined,
    checked: isChecked,
    ref: setInputRef,
    "aria-invalid": groupInvalid ? true : undefined,
    "aria-required": groupRequired ? true : undefined,
    "aria-readonly": appliedReadOnly ? true : undefined,
    "aria-disabled": isDisabled ? true : undefined,
    "aria-describedby": ariaDescribedBy,
    "aria-labelledby": ariaLabelledBy,
    onChange: handleInputChange
  };

  const labelProps: RadioLabelProps = {
    id: ids.labelId,
    htmlFor: ids.inputId
  };

  const descriptionProps: RadioDescriptionProps = {
    id: ids.descriptionId
  };

  return {
    rootProps,
    inputProps,
    inputRef: setInputRef,
    labelProps,
    descriptionProps,
    isChecked
  };
}
