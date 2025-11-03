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

// 상호작용 입력 타입 정의
export type PressPointerType = "mouse" | "touch" | "pen" | "keyboard" | "virtual";
export type PressPhase = "pressstart" | "pressend" | "press";

// 하나의 “press” 이벤트 단위를 표현
export interface PressEvent {
  readonly type: PressPhase;         // pressstart / pressend / press
  readonly pointerType: PressPointerType; // 입력 종류 (마우스/키보드 등)
  readonly target: EventTarget | null;
  readonly shiftKey: boolean;
  readonly ctrlKey: boolean;
  readonly altKey: boolean;
  readonly metaKey: boolean;
}

// 사용자가 받을 이벤트 핸들러 타입
export type PressHandler = (event: PressEvent) => void;

// useButton 훅 옵션
export interface UseButtonOptions {
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly href?: string;
  readonly elementType?: "button" | "link" | "custom";
  readonly onPress?: PressHandler;         // 전체 press 완료 시
  readonly onPressStart?: PressHandler;    // press 시작 시
  readonly onPressEnd?: PressHandler;      // press 해제 시
}

// 훅 반환 타입
export interface UseButtonResult<T extends HTMLElement = HTMLElement> {
  readonly buttonProps: ButtonEventHandlers<T>;
  readonly isPressed: boolean; // 눌림 상태
}

// 실제 버튼 이벤트 핸들러 세트
interface ButtonEventHandlers<T extends HTMLElement> {
  readonly onClick: (event: ReactMouseEvent<T>) => void;
  readonly onKeyDown: (event: ReactKeyboardEvent<T>) => void;
  readonly onKeyUp: (event: ReactKeyboardEvent<T>) => void;
  readonly onPointerDown: (event: ReactPointerEvent<T>) => void;
  readonly onPointerUp: (event: ReactPointerEvent<T>) => void;
  readonly onPointerCancel: (event: ReactPointerEvent<T>) => void;
  readonly onPointerLeave: (event: ReactPointerEvent<T>) => void;
}

// 공통 modifier 키 접근을 위한 ReactSyntheticEvent 확장
type ModifiableReactEvent = ReactSyntheticEvent<Element, Event> & {
  readonly shiftKey: boolean;
  readonly ctrlKey: boolean;
  readonly altKey: boolean;
  readonly metaKey: boolean;
};

// React 이벤트 → PressEvent 변환
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

// 브라우저의 pointerType을 PressPointerType으로 강제 변환
function coercePointerType(pointerType: string | undefined): PressPointerType {
  if (pointerType === "touch" || pointerType === "pen" || pointerType === "mouse") {
    return pointerType;
  }
  return "virtual";
}

// 메인 훅: 클릭/터치/키보드 입력을 통합 press 이벤트로 관리
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

  // 내부 상태 및 ref 구성
  const [isPressed, setPressed] = useState(false);            // 현재 눌림 여부
  const isPressedRef = useRef(false);                         // 동기 ref 버전
  const activePointerId = useRef<number | null>(null);        // 현재 활성 포인터 id
  const pointerTypeRef = useRef<PressPointerType>("mouse");   // 현재 입력 타입
  const isKeyboardPressed = useRef(false);                    // 키보드 입력 중 여부
  const interactionDisabled = disabled || loading;            // 비활성 상태
  const resolvedElementType = useMemo<"button" | "link" | "custom">(() => {
    if (elementType) return elementType;
    return href ? "link" : "button";
  }, [elementType, href]);

  // 눌림 상태 변경 (state + ref 동기화)
  const setPressedState = useCallback(
    (value: boolean) => {
      if (isPressedRef.current !== value) {
        isPressedRef.current = value;
        setPressed(value);
      }
    },
    [setPressed]
  );

  // pressstart 이벤트 발생
  const emitPressStart = useCallback(
    <E extends ModifiableReactEvent>(pointerType: PressPointerType, event: E) => {
      setPressedState(true);
      onPressStart?.(createPressEvent("pressstart", pointerType, event));
    },
    [onPressStart, setPressedState]
  );

  // pressend 이벤트 발생
  const emitPressEnd = useCallback(
    <E extends ModifiableReactEvent>(pointerType: PressPointerType, event: E) => {
      if (!isPressedRef.current) return;
      setPressedState(false);
      onPressEnd?.(createPressEvent("pressend", pointerType, event));
    },
    [onPressEnd, setPressedState]
  );

  // press 이벤트(완료) 발생
  const emitPress = useCallback(
    <E extends ModifiableReactEvent>(pointerType: PressPointerType, event: E) => {
      onPress?.(createPressEvent("press", pointerType, event));
    },
    [onPress]
  );

  // 포인터 취소/leave 시 눌림 상태 초기화
  const cancelPointerPress = useCallback(
    <E extends ReactPointerEvent<Element>>(event: E) => {
      if (activePointerId.current === null) return;

      // 포인터 캡처 해제 (브라우저 안전 처리)
      if (typeof event.currentTarget.releasePointerCapture === "function") {
        try {
          event.currentTarget.releasePointerCapture(activePointerId.current);
        } catch {
          // 일부 환경(jsdom 등)은 지원하지 않음
        }
      }

      activePointerId.current = null;
      emitPressEnd(pointerTypeRef.current, event);
    },
    [emitPressEnd]
  );

  // 포인터 눌림 시작
  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<T>) => {
      if (interactionDisabled) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      // 좌클릭만 허용, 이미 포인터 active면 무시
      if (event.button !== 0 || activePointerId.current !== null) return;

      const pointerType = coercePointerType(event.pointerType);
      pointerTypeRef.current = pointerType;
      activePointerId.current = event.pointerId;

      // 브라우저 포인터 캡처 설정
      if (typeof event.currentTarget.setPointerCapture === "function") {
        try {
          event.currentTarget.setPointerCapture(event.pointerId);
        } catch {
          // jsdom 비호환 방지
        }
      }

      emitPressStart(pointerType, event);
    },
    [interactionDisabled, emitPressStart]
  );

  // 포인터 해제
  const handlePointerUp = useCallback(
    (event: ReactPointerEvent<T>) => {
      if (activePointerId.current !== event.pointerId) return;

      const pointerType = pointerTypeRef.current;
      activePointerId.current = null;

      // 포인터 캡처 해제
      if (typeof event.currentTarget.releasePointerCapture === "function") {
        try {
          event.currentTarget.releasePointerCapture(event.pointerId);
        } catch {
          // 지원 안 되는 브라우저 대비
        }
      }

      emitPressEnd(pointerType, event);

      // disabled가 아닐 때만 실제 press 완료 이벤트 발생
      if (!interactionDisabled) emitPress(pointerType, event);
    },
    [emitPress, emitPressEnd, interactionDisabled]
  );

  // 포인터 취소 및 이탈
  const handlePointerCancel = useCallback(
    (event: ReactPointerEvent<T>) => cancelPointerPress(event),
    [cancelPointerPress]
  );

  const handlePointerLeave = useCallback(
    (event: ReactPointerEvent<T>) => {
      if (activePointerId.current !== event.pointerId) return;
      cancelPointerPress(event);
    },
    [cancelPointerPress]
  );

  // 키보드 입력 시작 처리 (Space, Enter)
  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<T>) => {
      if (interactionDisabled || event.repeat) return;

      if (event.key === " " || event.key === "Spacebar") {
        // 링크 등에서는 기본 스크롤 방지
        if (resolvedElementType !== "button") event.preventDefault();

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

  // 키보드 입력 해제 처리
  const handleKeyUp = useCallback(
    (event: ReactKeyboardEvent<T>) => {
      if (!isKeyboardPressed.current) return;

      if (event.key === " " || event.key === "Spacebar" || event.key === "Enter") {
        // Space 키는 click 이벤트를 수동 트리거
        if (event.key === " " || event.key === "Spacebar") {
          if (resolvedElementType !== "button") {
            event.preventDefault();
            if ("click" in event.currentTarget) {
              try {
                (event.currentTarget as unknown as { click(): void }).click();
              } catch {
                // 사용자 정의 요소가 click을 지원하지 않는 경우
              }
            }
          }
        }

        emitPressEnd("keyboard", event);

        if (!interactionDisabled) emitPress("keyboard", event);
      }

      isKeyboardPressed.current = false;
    },
    [emitPress, emitPressEnd, interactionDisabled, resolvedElementType]
  );

  // disabled/loading 시 클릭 차단
  const handleClick = useCallback(
    (event: ReactMouseEvent<T>) => {
      if (interactionDisabled) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    [interactionDisabled]
  );

  // disabled/loading 상태 변화 시 눌림 상태 리셋
  useEffect(() => {
    if (interactionDisabled && isPressedRef.current) {
      setPressedState(false);
      isKeyboardPressed.current = false;
      activePointerId.current = null;
    }
  }, [interactionDisabled, setPressedState]);

  // React 이벤트 핸들러 묶음 반환
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

  // 버튼 속성과 눌림 상태 반환
  return { buttonProps, isPressed };
}
