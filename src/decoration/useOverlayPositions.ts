import { type RefObject, useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState } from "react";
import { type BaseRange } from "slate";
import type { ReactEditor } from "slate-react";

import type { LoroEditor } from "../plugins/with-loro";
import type { CursorUser, LoroPresenceEditor, PresenceState } from "../plugins/with-loro-presence";
import { cursorToSlatePoint } from "../plugins/with-loro-presence";
import { peerToColor } from "./color-utils";
import {
  getOverlayPosition,
  type CaretPosition,
  type OverlayPosition,
  type SelectionRect,
} from "./getOverlayPosition";

export interface CursorOverlayData {
  peer: string;
  user?: CursorUser;
  color: string;
  range: BaseRange | null;
  caretPosition: CaretPosition | null;
  selectionRects: SelectionRect[];
}

type LoroPresenceEditorFull = LoroEditor & LoroPresenceEditor & ReactEditor;

interface ResolvedCursor {
  peer: string;
  user?: CursorUser;
  color: string;
  range: BaseRange;
}

function resolveCursors(editor: LoroPresenceEditorFull): ResolvedCursor[] {
  const all = editor.presence.getAll();
  const result: ResolvedCursor[] = [];

  for (const [peer, state] of Object.entries(all) as [string, PresenceState][]) {
    if (peer === editor.presence.key) continue;
    if (!state.anchor || !state.focus) continue;

    const anchorPoint = cursorToSlatePoint(editor.doc, state.anchor);
    const focusPoint = cursorToSlatePoint(editor.doc, state.focus);
    if (!anchorPoint || !focusPoint) continue;

    result.push({
      peer,
      user: state.user,
      color: state.user?.color ?? peerToColor(peer),
      range: {
        anchor: { path: anchorPoint.path, offset: anchorPoint.offset },
        focus: { path: focusPoint.path, offset: focusPoint.offset },
      },
    });
  }

  return result;
}

export function useOverlayPositions<TContainer extends HTMLElement = HTMLDivElement>(
  editor: LoroPresenceEditorFull,
  containerRef: RefObject<TContainer | null>
): CursorOverlayData[] {
  const [, rerender] = useReducer((s: number) => s + 1, 0);
  const animationFrameRef = useRef<number | null>(null);

  const [cursors, setCursors] = useState<ResolvedCursor[]>(() => resolveCursors(editor));

  useEffect(() => {
    return editor.presence.store.subscribe((event) => {
      if (event.by !== "local") {
        setCursors(resolveCursors(editor));
      }
    });
  }, [editor]);

  const overlayCache = useRef(new WeakMap<BaseRange, OverlayPosition>());
  const [overlayPositions, setOverlayPositions] = useState<Record<string, OverlayPosition>>({});

  // ResizeObserver: invalidate cache and re-render on container resize
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver(() => {
      overlayCache.current = new WeakMap();
      // Debounced re-render via rAF
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(() => {
        animationFrameRef.current = null;
        rerender();
      });
    });

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [containerRef]);

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const xOffset = containerRect.x;
    const yOffset = containerRect.y - containerRef.current.scrollTop;

    let changed = Object.keys(overlayPositions).length !== cursors.length;

    const updated: Record<string, OverlayPosition> = {};
    for (const cursor of cursors) {
      const cached = overlayCache.current.get(cursor.range);
      if (cached) {
        updated[cursor.peer] = cached;
        continue;
      }

      const pos = getOverlayPosition(editor, cursor.range, { xOffset, yOffset });
      overlayCache.current.set(cursor.range, pos);
      updated[cursor.peer] = pos;
      changed = true;
    }

    if (changed) {
      setOverlayPositions(updated);
    }
  });

  return useMemo(
    () =>
      cursors.map((cursor) => {
        const pos = overlayPositions[cursor.peer];
        return {
          peer: cursor.peer,
          user: cursor.user,
          color: cursor.color,
          range: cursor.range,
          caretPosition: pos?.caretPosition ?? null,
          selectionRects: pos?.selectionRects ?? [],
        };
      }),
    [cursors, overlayPositions]
  );
}
