import {
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CompositionEvent,
  type KeyboardEvent
} from "react";

export type TextFieldType = "text" | "email" | "password" | "number";

export interface UseTextFieldOptions {
  readonly id?: string;
  readonly name?: string;
  readonly type?: TextFieldType;
  readonly value?: string;
  readonly defaultValue?: string;
  readonly required?: boolean;
  readonly disabled?: boolean;
  readonly readOnly?: boolean;
  readonly hasHelperText?: boolean;
  readonly hasErrorText?: boolean;
  readonly describedByIds?: readonly string[];
  readonly onValueChange?: (value: string) => void;
  readonly onCommit?: (value: string) => void;
}

interface UseTextFieldIds {
  readonly inputId: string;
  readonly labelId: string;
  readonly descriptionId: string;
  readonly errorId: string;
}

export interface UseTextFieldResult {
  readonly inputProps: TextFieldInputProps;
  readonly labelProps: TextFieldLabelProps;
  readonly descriptionProps: TextFieldDescriptionProps;
  readonly errorProps: TextFieldErrorProps;
  readonly value: string;
  readonly isComposing: boolean;
}

export interface TextFieldInputProps {
  readonly id: string;
  readonly name?: string;
  readonly type: TextFieldType;
  readonly value: string;
  readonly required?: boolean;
  readonly disabled?: boolean;
  readonly readOnly?: boolean;
  readonly "aria-invalid"?: true;
  readonly "aria-required"?: true;
  readonly "aria-readonly"?: true;
  readonly "aria-disabled"?: true;
  readonly "aria-describedby"?: string;
  readonly onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  readonly onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  readonly onCompositionStart: (event: CompositionEvent<HTMLInputElement>) => void;
  readonly onCompositionEnd: (event: CompositionEvent<HTMLInputElement>) => void;
}

export interface TextFieldLabelProps {
  readonly id: string;
  readonly htmlFor: string;
}

export interface TextFieldDescriptionProps {
  readonly id: string;
}

export interface TextFieldErrorProps {
  readonly id: string;
}

export function useTextField(options: UseTextFieldOptions = {}): UseTextFieldResult {
  const {
    id,
    name,
    type = "text",
    value,
    defaultValue = "",
    required = false,
    disabled = false,
    readOnly = false,
    hasHelperText = false,
    hasErrorText = false,
    describedByIds = [],
    onValueChange,
    onCommit
  } = options;

  const generatedId = useId();
  const ids = useMemo<UseTextFieldIds>(() => {
    const inputId = id ?? `ara-text-field-${generatedId}`;
    return {
      inputId,
      labelId: `${inputId}-label`,
      descriptionId: `${inputId}-description`,
      errorId: `${inputId}-error`
    };
  }, [generatedId, id]);

  const isControlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<string>(defaultValue);
  const currentValue = isControlled ? value ?? "" : uncontrolledValue;
  const valueRef = useRef<string>(currentValue);
  const [isComposing, setIsComposing] = useState(false);
  const isComposingRef = useRef(false);

  const setComposing = useCallback((next: boolean) => {
    if (isComposingRef.current !== next) {
      isComposingRef.current = next;
      setIsComposing(next);
    }
  }, []);

  const updateValue = useCallback(
    (nextValue: string) => {
      valueRef.current = nextValue;
      if (!isControlled) {
        setUncontrolledValue(nextValue);
      }
      onValueChange?.(nextValue);
    },
    [isControlled, onValueChange]
  );

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (disabled || readOnly) return;
      updateValue(event.target.value);
    },
    [disabled, readOnly, updateValue]
  );

  const handleCompositionStart = useCallback(() => {
    setComposing(true);
  }, [setComposing]);

  const handleCompositionEnd = useCallback(
    (event: CompositionEvent<HTMLInputElement>) => {
      setComposing(false);
      if (disabled || readOnly) return;
      updateValue(event.currentTarget.value);
    },
    [disabled, readOnly, updateValue, setComposing]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== "Enter") return;
      if (disabled || isComposingRef.current) return;

      event.preventDefault();
      onCommit?.(valueRef.current);
    },
    [disabled, onCommit]
  );

  valueRef.current = currentValue;

  const ariaDescribedBy = useMemo(() => {
    const idsToApply: string[] = [];

    if (hasErrorText) idsToApply.push(ids.errorId);
    if (hasHelperText) idsToApply.push(ids.descriptionId);
    if (describedByIds.length > 0) idsToApply.push(...describedByIds);

    return idsToApply.length > 0 ? idsToApply.join(" ") : undefined;
  }, [describedByIds, hasErrorText, hasHelperText, ids.descriptionId, ids.errorId]);

  const inputProps: TextFieldInputProps = {
    id: ids.inputId,
    name,
    type,
    value: currentValue,
    required: required || undefined,
    disabled: disabled || undefined,
    readOnly: readOnly || undefined,
    "aria-invalid": hasErrorText || undefined,
    "aria-required": required || undefined,
    "aria-readonly": readOnly || undefined,
    "aria-disabled": disabled || undefined,
    "aria-describedby": ariaDescribedBy,
    onChange: handleChange,
    onKeyDown: handleKeyDown,
    onCompositionStart: handleCompositionStart,
    onCompositionEnd: handleCompositionEnd
  };

  const labelProps: TextFieldLabelProps = {
    id: ids.labelId,
    htmlFor: ids.inputId
  };

  const descriptionProps: TextFieldDescriptionProps = {
    id: ids.descriptionId
  };

  const errorProps: TextFieldErrorProps = {
    id: ids.errorId
  };

  return {
    inputProps,
    labelProps,
    descriptionProps,
    errorProps,
    value: valueRef.current,
    isComposing: isComposingRef.current || isComposing
  };
}
