import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type SyntheticEvent as ReactSyntheticEvent
} from "react";

export type PressPointerType = "mouse" | "touch" | "pen" | "keyboard" | "virtual";
export type PressPhase = "pressstart" | "pressend" | "press";

export interface PressEvent {
  readonly type: PressPhase;
  readonly pointerType: PressPointerType;
  readonly target: EventTarget | null;
  readonly shiftKey: boolean;
  readonly ctrlKey: boolean;
  readonly altKey: boolean;
  readonly metaKey: boolean;
}

export type PressHandler = (event: PressEvent) => void;

export interface UseButtonOptions {
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly href?: string;
  readonly elementType?: "button" | "link" | "custom";
  readonly onPress?: PressHandler;
  readonly onPressStart?: PressHandler;
  readonly onPressEnd?: PressHandler;
}

export interface UseButtonResult<T extends HTMLElement = HTMLElement> {
  readonly buttonProps: ButtonEventHandlers<T>;
  readonly isPressed: boolean;
}

interface ButtonEventHandlers<T extends HTMLElement> {
  readonly onClick: (event: ReactMouseEvent<T>) => void;
  readonly onKeyDown: (event: ReactKeyboardEvent<T>) => void;
  readonly onKeyUp: (event: ReactKeyboardEvent<T>) => void;
  readonly onPointerDown: (event: ReactPointerEvent<T>) => void;
  readonly onPointerUp: (event: ReactPointerEvent<T>) => void;
  readonly onPointerCancel: (event: ReactPointerEvent<T>) => void;
  readonly onPointerLeave: (event: ReactPointerEvent<T>) => void;
}

type ModifiableReactEvent = ReactSyntheticEvent<Element, Event> & {
  readonly shiftKey: boolean;
  readonly ctrlKey: boolean;
  readonly altKey: boolean;
  readonly metaKey: boolean;
};

function createPressEvent<E extends ModifiableReactEvent>(
  type: PressPhase,
  pointerType: PressPointerType,
  event: E
): PressEvent {
  return {
    type,
    pointerType,
    target: event.currentTarget,
    shiftKey: event.shiftKey,
    ctrlKey: event.ctrlKey,
    altKey: event.altKey,
    metaKey: event.metaKey
  };
}

function coercePointerType(pointerType: string | undefined): PressPointerType {
  if (pointerType === "touch" || pointerType === "pen" || pointerType === "mouse") {
    return pointerType;
  }

  return "virtual";
}

export function useButton<T extends HTMLElement = HTMLElement>(
  options: UseButtonOptions = {}
): UseButtonResult<T> {
  const {
    disabled = false,
    loading = false,
    href,
    elementType,
    onPress,
    onPressStart,
    onPressEnd
  } = options;

  const [isPressed, setPressed] = useState(false);
  const isPressedRef = useRef(false);
  const activePointerId = useRef<number | null>(null);
  const pointerTypeRef = useRef<PressPointerType>("mouse");
  const isKeyboardPressed = useRef(false);
  const interactionDisabled = disabled || loading;
  const resolvedElementType = useMemo<"button" | "link" | "custom">(() => {
    if (elementType) {
      return elementType;
    }

    return href ? "link" : "button";
  }, [elementType, href]);

  const setPressedState = useCallback(
    (value: boolean) => {
      if (isPressedRef.current !== value) {
        isPressedRef.current = value;
        setPressed(value);
      }
    },
    [setPressed]
  );

  const emitPressStart = useCallback(
    <E extends ModifiableReactEvent>(
      pointerType: PressPointerType,
      event: E
    ) => {
      setPressedState(true);
      onPressStart?.(createPressEvent("pressstart", pointerType, event));
    },
    [onPressStart, setPressedState]
  );

  const emitPressEnd = useCallback(
    <E extends ModifiableReactEvent>(
      pointerType: PressPointerType,
      event: E
    ) => {
      if (!isPressedRef.current) {
        return;
      }

      setPressedState(false);
      onPressEnd?.(createPressEvent("pressend", pointerType, event));
    },
    [onPressEnd, setPressedState]
  );

  const emitPress = useCallback(
    <E extends ModifiableReactEvent>(
      pointerType: PressPointerType,
      event: E
    ) => {
      onPress?.(createPressEvent("press", pointerType, event));
    },
    [onPress]
  );

  const cancelPointerPress = useCallback(
    <E extends ReactPointerEvent<Element>>(
      event: E
    ) => {
      if (activePointerId.current === null) {
        return;
      }

      if (typeof event.currentTarget.releasePointerCapture === "function") {
        try {
          event.currentTarget.releasePointerCapture(activePointerId.current);
        } catch {
          // 비지원 환경 대비.
        }
      }

      activePointerId.current = null;
      emitPressEnd(pointerTypeRef.current, event);
    },
    [emitPressEnd]
  );

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<T>) => {
      if (interactionDisabled) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      if (event.button !== 0 || activePointerId.current !== null) {
        return;
      }

      const pointerType = coercePointerType(event.pointerType);
      pointerTypeRef.current = pointerType;
      activePointerId.current = event.pointerId;

      if (typeof event.currentTarget.setPointerCapture === "function") {
        try {
          event.currentTarget.setPointerCapture(event.pointerId);
        } catch {
          // jsdom 또는 비지원 환경에서는 setPointerCapture가 throw할 수 있다.
        }
      }

      emitPressStart(pointerType, event);
    },
    [interactionDisabled, emitPressStart]
  );

  const handlePointerUp = useCallback(
    (event: ReactPointerEvent<T>) => {
      if (activePointerId.current !== event.pointerId) {
        return;
      }

      const pointerType = pointerTypeRef.current;
      activePointerId.current = null;

      if (typeof event.currentTarget.releasePointerCapture === "function") {
        try {
          event.currentTarget.releasePointerCapture(event.pointerId);
        } catch {
          // 비지원 환경에 대비.
        }
      }

      emitPressEnd(pointerType, event);

      if (!interactionDisabled) {
        emitPress(pointerType, event);
      }
    },
    [emitPress, emitPressEnd, interactionDisabled]
  );

  const handlePointerCancel = useCallback(
    (event: ReactPointerEvent<T>) => {
      cancelPointerPress(event);
    },
    [cancelPointerPress]
  );

  const handlePointerLeave = useCallback(
    (event: ReactPointerEvent<T>) => {
      if (activePointerId.current !== event.pointerId) {
        return;
      }

      cancelPointerPress(event);
    },
    [cancelPointerPress]
  );

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<T>) => {
      if (interactionDisabled || event.repeat) {
        return;
      }

      if (event.key === " " || event.key === "Spacebar") {
        if (resolvedElementType !== "button") {
          event.preventDefault();
        }

        isKeyboardPressed.current = true;
        pointerTypeRef.current = "keyboard";
        emitPressStart("keyboard", event);
      } else if (event.key === "Enter") {
        isKeyboardPressed.current = true;
        pointerTypeRef.current = "keyboard";
        emitPressStart("keyboard", event);
      }
    },
    [emitPressStart, interactionDisabled, resolvedElementType]
  );

  const handleKeyUp = useCallback(
    (event: ReactKeyboardEvent<T>) => {
      if (!isKeyboardPressed.current) {
        return;
      }

      if (event.key === " " || event.key === "Spacebar" || event.key === "Enter") {
        if (event.key === " " || event.key === "Spacebar") {
          if (resolvedElementType !== "button") {
            event.preventDefault();
            if ("click" in event.currentTarget) {
              try {
                (event.currentTarget as unknown as { click(): void }).click();
              } catch {
                // noop - 사용자 정의 요소가 click을 지원하지 않는 경우.
              }
            }
          }
        }

        emitPressEnd("keyboard", event);

        if (!interactionDisabled) {
          emitPress("keyboard", event);
        }
      }

      isKeyboardPressed.current = false;
    },
    [emitPress, emitPressEnd, interactionDisabled, resolvedElementType]
  );

  const handleClick = useCallback(
    (event: ReactMouseEvent<T>) => {
      if (interactionDisabled) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    [interactionDisabled]
  );

  useEffect(() => {
    if (interactionDisabled && isPressedRef.current) {
      setPressedState(false);
      isKeyboardPressed.current = false;
      activePointerId.current = null;
    }
  }, [interactionDisabled, setPressedState]);

  const buttonProps = useMemo<ButtonEventHandlers<T>>(
    () => ({
      onClick: handleClick,
      onKeyDown: handleKeyDown,
      onKeyUp: handleKeyUp,
      onPointerDown: handlePointerDown,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerCancel,
      onPointerLeave: handlePointerLeave
    }),
    [
      handleClick,
      handleKeyDown,
      handleKeyUp,
      handlePointerDown,
      handlePointerUp,
      handlePointerCancel,
      handlePointerLeave
    ]
  );

  return { buttonProps, isPressed };
}
