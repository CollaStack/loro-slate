import React, { useCallback, useEffect, useState } from "react";
import { Path, Range, Text, type BaseRange, type NodeEntry } from "slate";
import type { RenderLeafProps } from "slate-react";
import { PresenceCaret } from "./PresenceCaret";
import { peerToColor, withAlpha } from "./color-utils";

import type { LoroEditor } from "../plugins/with-loro";
import type {
  CursorUser,
  LoroPresenceEditor,
  PresenceState,
} from "../plugins/with-loro-presence";
import { cursorToSlatePoint } from "../plugins/with-loro-presence";

// ────────────────────────────────────────────────────────────
// Decoration keys & types
// ────────────────────────────────────────────────────────────

export const LORO_SELECTION_KEY = "loroPresenceSelection";
export const LORO_CARET_KEY = "loroPresenceCaret";

export interface LoroDecorationMark {
  peer: string;
  user?: CursorUser;
}

// ────────────────────────────────────────────────────────────
// Internal resolved presence
// ────────────────────────────────────────────────────────────

interface ResolvedPresence {
  peer: string;
  user?: CursorUser;
  anchor: { path: number[]; offset: number };
  focus: { path: number[]; offset: number };
}

type LoroPresenceEditorFull = LoroEditor & LoroPresenceEditor;

function resolvePresences(editor: LoroPresenceEditorFull): ResolvedPresence[] {
  const all = editor.presence.getAll();
  const result: ResolvedPresence[] = [];

  for (const [peer, state] of Object.entries(all) as [
    string,
    PresenceState,
  ][]) {
    if (peer === editor.presence.key) continue;
    if (!state.anchor || !state.focus) continue;

    const anchorPoint = cursorToSlatePoint(editor.doc, state.anchor);
    const focusPoint = cursorToSlatePoint(editor.doc, state.focus);
    if (!anchorPoint || !focusPoint) continue;

    result.push({
      peer,
      user: state.user,
      anchor: { path: anchorPoint.path, offset: anchorPoint.offset },
      focus: { path: focusPoint.path, offset: focusPoint.offset },
    });
  }

  return result;
}

// ────────────────────────────────────────────────────────────
// useLoroDecorate
// ────────────────────────────────────────────────────────────

/**
 * Returns a `decorate` function that marks leaf nodes with remote peers'
 * selection and caret positions. Pass it to `<Editable decorate={...}>`.
 *
 * ```tsx
 * const decorate = useLoroDecorate(editor);
 * <Editable decorate={decorate} renderLeaf={wrapLoroRenderLeaf(renderLeaf)} />
 * ```
 */
// BaseRange doesn't carry an index signature, so we extend it locally for
// decoration ranges that hold custom properties alongside anchor/focus.
type DecoratedRange = BaseRange & Record<string, unknown>;

export function useLoroDecorate(
  editor: LoroPresenceEditorFull
): (entry: NodeEntry) => BaseRange[] {
  const [presences, setPresences] = useState<ResolvedPresence[]>(() =>
    resolvePresences(editor)
  );

  useEffect(() => {
    return editor.presence.store.subscribe((event) => {
      if (event.by !== "local") {
        setPresences(resolvePresences(editor));
      }
    });
  }, [editor]);

  const decorate = useCallback(
    ([node, path]: NodeEntry): BaseRange[] => {
      if (!Text.isText(node)) return [];

      const result: DecoratedRange[] = [];
      const nodeRange: BaseRange = {
        anchor: { path, offset: 0 },
        focus: { path, offset: node.text.length },
      };

      for (const presence of presences) {
        const mark: LoroDecorationMark = {
          peer: presence.peer,
          user: presence.user,
        };

        const selRange: BaseRange = {
          anchor: presence.anchor as { path: number[]; offset: number },
          focus: presence.focus as { path: number[]; offset: number },
        };

        const isCollapsed =
          Path.equals(presence.anchor.path, presence.focus.path) &&
          presence.anchor.offset === presence.focus.offset;

        // Selection background for non-collapsed ranges
        if (!isCollapsed) {
          const intersection = Range.intersection(
            selRange as Range,
            nodeRange as Range
          );
          if (intersection) {
            result.push({ ...intersection, [LORO_SELECTION_KEY]: mark });
          }
        }

        // Caret at the focus point
        if (Path.equals(presence.focus.path as number[], path)) {
          const caretPoint = { path, offset: presence.focus.offset };
          result.push({
            anchor: caretPoint,
            focus: caretPoint,
            [LORO_CARET_KEY]: mark,
          });
        }
      }

      return result as BaseRange[];
    },
    [presences]
  );

  return decorate;
}

// ────────────────────────────────────────────────────────────
// wrapLoroRenderLeaf
// ────────────────────────────────────────────────────────────

/**
 * Wraps an existing `renderLeaf` to add remote cursor and selection rendering.
 * Selection ranges get a translucent background; carets render a coloured
 * blinking bar with the user's name label.
 *
 * ```tsx
 * <Editable
 *   decorate={loroDecorate}
 *   renderLeaf={wrapLoroRenderLeaf(renderLeaf)}
 * />
 * ```
 */
export function wrapLoroRenderLeaf(
  renderLeaf: (props: RenderLeafProps) => React.ReactElement
): (props: RenderLeafProps) => React.ReactElement {
  return (props: RenderLeafProps) => {
    const leaf = props.leaf as unknown as Record<string, unknown>;

    const selectionMark = leaf[LORO_SELECTION_KEY] as
      | LoroDecorationMark
      | undefined;
    const caretMark = leaf[LORO_CARET_KEY] as LoroDecorationMark | undefined;

    let { children } = props;

    if (selectionMark) {
      const color =
        selectionMark.user?.color ?? peerToColor(selectionMark.peer);
      children = (
        <span style={{ backgroundColor: withAlpha(color, 0.3) }}>
          {children}
        </span>
      );
    }

    if (caretMark) {
      children = (
        <>
          {children}
          <PresenceCaret peer={caretMark.peer} user={caretMark.user} />
        </>
      );
    }

    return renderLeaf({ ...props, children });
  };
}

