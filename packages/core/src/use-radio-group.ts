import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

export type RadioGroupOrientation = "horizontal" | "vertical";

export interface UseRadioGroupOptions {
  readonly id?: string;
  readonly name?: string;
  readonly value?: string;
  readonly defaultValue?: string;
  readonly required?: boolean;
  readonly disabled?: boolean;
  readonly readOnly?: boolean;
  readonly invalid?: boolean;
  readonly orientation?: RadioGroupOrientation;
  readonly loop?: boolean;
  readonly hasLabel?: boolean;
  readonly hasDescription?: boolean;
  readonly describedByIds?: readonly string[];
  readonly labelledByIds?: readonly string[];
  readonly onValueChange?: (value: string) => void;
}

interface UseRadioGroupIds {
  readonly rootId: string;
  readonly labelId: string;
  readonly descriptionId: string;
}

export interface RadioGroupRootProps {
  readonly id: string;
  readonly role: "radiogroup";
  readonly "aria-labelledby"?: string;
  readonly "aria-describedby"?: string;
  readonly "aria-required"?: true;
  readonly "aria-invalid"?: true;
  readonly "aria-readonly"?: true;
  readonly "aria-disabled"?: true;
  readonly "aria-orientation"?: RadioGroupOrientation;
  readonly "data-disabled"?: true;
  readonly "data-readonly"?: true;
  readonly "data-orientation": RadioGroupOrientation;
}

export interface RadioGroupLabelProps {
  readonly id: string;
  readonly htmlFor: string;
}

export interface RadioGroupDescriptionProps {
  readonly id: string;
}

export interface RadioItemController {
  readonly value: string;
  readonly isDisabled: () => boolean;
  readonly setTabIndex: (tabIndex: number) => void;
  readonly focus: () => void;
}

export interface UseRadioGroupResult {
  readonly rootProps: RadioGroupRootProps;
  readonly labelProps: RadioGroupLabelProps;
  readonly descriptionProps: RadioGroupDescriptionProps;
  readonly value?: string;
  readonly name?: string;
  readonly isDisabled: boolean;
  readonly isReadOnly: boolean;
  readonly required: boolean;
  readonly invalid: boolean;
  readonly orientation: RadioGroupOrientation;
  readonly loop: boolean;
  readonly registerItem: (controller: RadioItemController) => () => void;
  readonly updateTabStops: () => void;
  readonly setValue: (value: string) => void;
  readonly handleArrowNavigation: (current: string, key: string) => void;
}

export function useRadioGroup(options: UseRadioGroupOptions = {}): UseRadioGroupResult {
  const {
    id,
    name,
    value,
    defaultValue,
    required = false,
    disabled = false,
    readOnly = false,
    invalid = false,
    orientation = "horizontal",
    loop = true,
    hasLabel = true,
    hasDescription = false,
    describedByIds = [],
    labelledByIds = [],
    onValueChange
  } = options;

  const generatedId = useId();
  const ids = useMemo<UseRadioGroupIds>(() => {
    const rootId = id ?? `ara-radio-group-${generatedId}`;
    return {
      rootId,
      labelId: `${rootId}-label`,
      descriptionId: `${rootId}-description`
    };
  }, [generatedId, id]);

  const groupName = useMemo(() => name ?? ids.rootId, [ids.rootId, name]);
  const appliedReadOnly = !disabled && readOnly;
  const isControlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<string | undefined>(defaultValue);
  const currentValue = isControlled ? value : uncontrolledValue;
  const activeValueRef = useRef<string | undefined>(currentValue);
  const itemsRef = useRef<RadioItemController[]>([]);

  const setValue = useCallback(
    (nextValue: string) => {
      activeValueRef.current = nextValue;
      if (!isControlled) {
        setUncontrolledValue(nextValue);
      }
      onValueChange?.(nextValue);
    },
    [isControlled, onValueChange]
  );

  const updateTabStops = useCallback(() => {
    const items = itemsRef.current;
    const activeValue = activeValueRef.current ?? currentValue;

    let activeIndex = activeValue
      ? items.findIndex((item) => item.value === activeValue && !item.isDisabled())
      : -1;

    if (activeIndex === -1) {
      activeIndex = items.findIndex((item) => !item.isDisabled());
    }

    items.forEach((item, index) => {
      item.setTabIndex(index === activeIndex ? 0 : -1);
    });
  }, [currentValue]);

  const registerItem = useCallback(
    (controller: RadioItemController) => {
      itemsRef.current.push(controller);
      updateTabStops();

      return () => {
        itemsRef.current = itemsRef.current.filter((item) => item !== controller);
        updateTabStops();
      };
    },
    [updateTabStops]
  );

  const moveFocus = useCallback(
    (current: string, direction: "next" | "previous") => {
      const items = itemsRef.current;
      const currentIndex = items.findIndex((item) => item.value === current);
      if (currentIndex === -1 || items.length === 0) return;

      const total = items.length;
      for (let step = 1; step <= total; step += 1) {
        const offset = direction === "next" ? step : -step;
        const candidateIndex = currentIndex + offset;
        if (!loop && (candidateIndex < 0 || candidateIndex >= total)) return;

        const normalizedIndex = (candidateIndex + total) % total;
        const candidate = items[normalizedIndex];
        if (!candidate || candidate.isDisabled()) continue;

        setValue(candidate.value);
        candidate.focus();
        updateTabStops();
        return;
      }
    },
    [loop, setValue, updateTabStops]
  );

  const handleArrowNavigation = useCallback(
    (current: string, key: string) => {
      if (key === "ArrowRight" || key === "ArrowDown") {
        moveFocus(current, "next");
      } else if (key === "ArrowLeft" || key === "ArrowUp") {
        moveFocus(current, "previous");
      }
    },
    [moveFocus]
  );

  useEffect(() => {
    activeValueRef.current = currentValue;
    updateTabStops();
  }, [currentValue, updateTabStops]);

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

  const rootProps: RadioGroupRootProps = {
    id: ids.rootId,
    role: "radiogroup",
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy,
    "aria-required": required ? true : undefined,
    "aria-invalid": invalid ? true : undefined,
    "aria-readonly": appliedReadOnly ? true : undefined,
    "aria-disabled": disabled ? true : undefined,
    "aria-orientation": orientation,
    "data-disabled": disabled ? true : undefined,
    "data-readonly": appliedReadOnly ? true : undefined,
    "data-orientation": orientation
  };

  const labelProps: RadioGroupLabelProps = {
    id: ids.labelId,
    htmlFor: ids.rootId
  };

  const descriptionProps: RadioGroupDescriptionProps = {
    id: ids.descriptionId
  };

  return {
    rootProps,
    labelProps,
    descriptionProps,
    value: currentValue,
    name: groupName,
    isDisabled: disabled,
    isReadOnly: appliedReadOnly,
    required,
    invalid,
    orientation,
    loop,
    registerItem,
    updateTabStops,
    setValue,
    handleArrowNavigation
  };
}
