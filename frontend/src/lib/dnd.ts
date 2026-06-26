import { useRef, useState } from "react";

export function reorder<T>(list: T[], from: number, to: number): T[] {
  const next = list.slice();
  const [m] = next.splice(from, 1);
  next.splice(to, 0, m);
  return next;
}

export function useDragReorder<T extends { id: number }>(
  items: T[],
  onCommit: (ordered: T[]) => void,
) {
  const [list, setList] = useState<T[]>(items);
  const dragIdx = useRef<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  // sync when upstream content changes (ids/order/fields), not on every new array ref
  const sig = JSON.stringify(items);
  const lastSig = useRef(sig);
  if (lastSig.current !== sig) {
    lastSig.current = sig;
    queueMicrotask(() => setList(items));
  }


  const handlers = (index: number) => ({
    draggable: true,
    onDragStart: (e: React.DragEvent) => {
      dragIdx.current = index;
      e.dataTransfer.effectAllowed = "move";
    },
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (overIdx !== index) setOverIdx(index);
    },
    onDragLeave: () => {
      if (overIdx === index) setOverIdx(null);
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      const from = dragIdx.current;
      dragIdx.current = null;
      setOverIdx(null);
      if (from === null || from === index) return;
      const next = reorder(list, from, index);
      setList(next);
      onCommit(next);
    },
    onDragEnd: () => {
      dragIdx.current = null;
      setOverIdx(null);
    },
  });

  return { list, handlers, overIdx };
}
