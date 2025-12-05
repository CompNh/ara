import { useEffect } from "react";

export interface UseScrollLockOptions {
  readonly active?: boolean;
  readonly ownerDocument?: Document | null;
}

interface ScrollLockState {
  count: number;
  readonly restore: () => void;
}

const scrollLockStates = new WeakMap<Document, ScrollLockState>();

function preventTouchMove(event: TouchEvent, doc: Document) {
  if (!event.cancelable) return;

  const target = event.target as HTMLElement | null;
  if (!target) return;
  if (target.ownerDocument !== doc) return;

  if (target === doc.body || target === doc.documentElement) {
    event.preventDefault();
  }
}

function applyScrollLock(doc: Document): () => void {
  const existingState = scrollLockStates.get(doc);
  if (existingState) {
    existingState.count += 1;
    return () => releaseScrollLock(doc);
  }

  const body = doc.body;
  const documentElement = doc.documentElement;

  if (!body || !documentElement) {
    return () => undefined;
  }

  const previousOverflow = body.style.overflow;
  const previousPaddingRight = body.style.paddingRight;
  const previousOverscrollBehavior = body.style.overscrollBehavior;
  const previousDocumentOverscrollBehavior = documentElement.style.overscrollBehavior;
  const ownerWindow = doc.defaultView;

  const scrollbarWidth = ownerWindow
    ? ownerWindow.innerWidth - documentElement.clientWidth
    : 0;
  const computedPaddingRight = ownerWindow
    ? Number.parseFloat(ownerWindow.getComputedStyle(body).paddingRight || "0")
    : 0;

  const touchMoveHandler = (event: TouchEvent) => preventTouchMove(event, doc);

  body.style.overflow = "hidden";
  body.style.overscrollBehavior = "none";
  documentElement.style.overscrollBehavior = "none";

  if (scrollbarWidth > 0) {
    body.style.paddingRight = `${computedPaddingRight + scrollbarWidth}px`;
  }

  doc.addEventListener("touchmove", touchMoveHandler, { passive: false });

  scrollLockStates.set(doc, {
    count: 1,
    restore: () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
      body.style.overscrollBehavior = previousOverscrollBehavior;
      documentElement.style.overscrollBehavior = previousDocumentOverscrollBehavior;
      doc.removeEventListener("touchmove", touchMoveHandler);
    }
  });

  return () => releaseScrollLock(doc);
}

function releaseScrollLock(doc: Document) {
  const state = scrollLockStates.get(doc);
  if (!state) return;

  if (state.count > 1) {
    state.count -= 1;
    return;
  }

  scrollLockStates.delete(doc);
  state.restore();
}

function resolveDocument(ownerDocument?: Document | null): Document | null {
  if (ownerDocument) return ownerDocument;
  if (typeof document !== "undefined") return document;
  return null;
}

export function useScrollLock(options: UseScrollLockOptions = {}): void {
  const { active = true, ownerDocument } = options;
  const targetDocument = resolveDocument(ownerDocument);

  useEffect(() => {
    if (!active || !targetDocument) return undefined;

    const release = applyScrollLock(targetDocument);
    return () => release();
  }, [active, targetDocument]);
}
