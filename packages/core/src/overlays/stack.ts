export interface OverlayStackEntry {
  readonly id: symbol;
  node: HTMLElement | null;
}

export interface OverlayStackSnapshot {
  readonly stack: ReadonlyArray<OverlayStackEntry>;
  readonly topId?: symbol;
  readonly topNode?: HTMLElement | null;
}

type OverlayStackSubscriber = (snapshot: OverlayStackSnapshot) => void;

function findTopEntry(entries: OverlayStackEntry[]): OverlayStackEntry | undefined {
  let top: OverlayStackEntry | undefined;

  for (const entry of entries) {
    const entryNode = entry.node;
    if (!entryNode) continue;

    const isAncestor = entries.some(
      (other) => other.id !== entry.id && other.node && entryNode.contains(other.node)
    );

    if (isAncestor) continue;
    top = entry;
  }

  return top;
}

export class OverlayStackManager {
  private readonly stack: OverlayStackEntry[] = [];
  private readonly subscribers = new Set<OverlayStackSubscriber>();

  register(id: symbol, node: HTMLElement | null): void {
    this.stack.push({ id, node });
    this.notify();
  }

  unregister(id: symbol): void {
    const index = this.stack.findIndex((entry) => entry.id === id);
    if (index < 0) return;

    this.stack.splice(index, 1);
    this.notify();
  }

  updateNode(id: symbol, node: HTMLElement | null): void {
    const entry = this.stack.find((item) => item.id === id);
    if (!entry) return;

    entry.node = node;
    this.notify();
  }

  isTop(id: symbol): boolean {
    return this.snapshot().topId === id;
  }

  snapshot(): OverlayStackSnapshot {
    const clonedStack = [...this.stack];
    const topEntry = findTopEntry(clonedStack);
    return {
      stack: clonedStack,
      topId: topEntry?.id,
      topNode: topEntry?.node ?? null
    };
  }

  subscribe(subscriber: OverlayStackSubscriber): () => void {
    this.subscribers.add(subscriber);
    subscriber(this.snapshot());

    return () => {
      this.subscribers.delete(subscriber);
    };
  }

  clear(): void {
    this.stack.splice(0, this.stack.length);
    this.notify();
  }

  private notify(): void {
    const snapshot = this.snapshot();
    this.subscribers.forEach((subscriber) => subscriber(snapshot));
  }
}

export const overlayStack = new OverlayStackManager();
