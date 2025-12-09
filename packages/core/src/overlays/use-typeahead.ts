import { useCallback, useRef } from "react";

export interface TypeaheadItem {
  readonly id: string;
  readonly textValue: string;
  readonly disabled?: boolean;
}

export interface UseTypeaheadOptions {
  /** 매칭 대상 항목 목록 */
  readonly items: readonly TypeaheadItem[];
  /** 현재 포커스된 항목 id. 매칭 시작 지점을 결정한다. */
  readonly activeId?: string | null;
  /** true이면 목록 끝에서 다시 처음으로 순회 검색한다. */
  readonly loop?: boolean;
  /** 연속 타이핑 버퍼 리셋까지의 시간(ms). 기본 700ms. */
  readonly timeout?: number;
  /** 매칭 성공 시 호출된다. */
  readonly onMatch?: (item: TypeaheadItem) => void;
}

export interface UseTypeaheadResult {
  /** typeahead 키 입력을 처리하고 매칭된 항목을 반환한다. */
  readonly handleTypeahead: (event: Pick<KeyboardEvent, "key" | "altKey" | "ctrlKey" | "metaKey">) => TypeaheadItem | null;
  /** 내부 버퍼와 타이머를 초기화한다. */
  readonly resetTypeahead: () => void;
}

function isValidTypeaheadKey(event: Pick<KeyboardEvent, "key" | "altKey" | "ctrlKey" | "metaKey">): boolean {
  if (event.altKey || event.ctrlKey || event.metaKey) return false;
  if (event.key.length !== 1) return false;
  // Space/제어 문자는 선택/스크롤 등 다른 핸들러와 충돌할 수 있어 제외한다.
  return event.key.trim().length > 0;
}

function normalizeText(text: string): string {
  // 영문 기준 접두 검색만 지원하며, 한글 초성 대응은 제공하지 않는다.
  return text.trim().toLocaleLowerCase();
}

function findMatch(
  items: readonly TypeaheadItem[],
  search: string,
  startIndex: number,
  loop: boolean
): TypeaheadItem | null {
  if (!search) return null;

  const total = items.length;
  const normalizedSearch = normalizeText(search);

  for (let offset = 1; offset <= total; offset += 1) {
    const nextIndex = loop ? (startIndex + offset) % total : startIndex + offset;
    if (!loop && nextIndex >= total) break;

    const candidate = items[nextIndex];
    if (!candidate || candidate.disabled) continue;

    const candidateLabel = normalizeText(candidate.textValue);
    if (candidateLabel.startsWith(normalizedSearch)) {
      return candidate;
    }
  }

  return null;
}

export function useTypeahead(options: UseTypeaheadOptions): UseTypeaheadResult {
  const { items, activeId = null, loop = true, timeout = 700, onMatch } = options;

  const bufferRef = useRef("");
  const lastTypeTimeRef = useRef(0);
  const timeoutIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTypeahead = useCallback(() => {
    bufferRef.current = "";
    lastTypeTimeRef.current = 0;
    if (timeoutIdRef.current !== null) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
  }, []);

  const scheduleReset = useCallback(() => {
    if (timeoutIdRef.current !== null) {
      clearTimeout(timeoutIdRef.current);
    }
    timeoutIdRef.current = setTimeout(() => {
      resetTypeahead();
    }, timeout);
  }, [resetTypeahead, timeout]);

  const handleTypeahead = useCallback(
    (event: Pick<KeyboardEvent, "key" | "altKey" | "ctrlKey" | "metaKey">) => {
      if (!isValidTypeaheadKey(event)) return null;

      const now = Date.now();
      const isWithinWindow = lastTypeTimeRef.current && now - lastTypeTimeRef.current <= timeout;

      if (!isWithinWindow) {
        bufferRef.current = "";
      }

      bufferRef.current += event.key;
      lastTypeTimeRef.current = now;
      scheduleReset();

      const activeIndex = items.findIndex((item) => item.id === activeId);
      const startIndex = activeIndex < 0 ? -1 : activeIndex;

      let match = findMatch(items, bufferRef.current, startIndex, loop);

      // 버퍼 전체로 매칭되지 않으면 마지막 입력만으로 재탐색한다(예: "aaa" 순회).
      if (!match && bufferRef.current.length > 1) {
        bufferRef.current = event.key;
        match = findMatch(items, bufferRef.current, startIndex, loop);
      }

      if (match) {
        onMatch?.(match);
      }

      return match;
    },
    [activeId, items, loop, onMatch, scheduleReset, timeout]
  );

  return { handleTypeahead, resetTypeahead };
}
