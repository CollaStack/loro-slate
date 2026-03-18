import { type BaseRange, Editor, Path, Range, Text } from "slate";
import { ReactEditor } from "slate-react";

export type SelectionRect = {
  width: number;
  height: number;
  top: number;
  left: number;
};

export type CaretPosition = {
  height: number;
  top: number;
  left: number;
};

export type OverlayPosition = {
  caretPosition: CaretPosition | null;
  selectionRects: SelectionRect[];
};

export type GetOverlayPositionOptions = {
  xOffset: number;
  yOffset: number;
};

function toDOMRangeSafe(
  editor: Editor,
  range: BaseRange
): globalThis.Range | null {
  try {
    return ReactEditor.toDOMRange(editor as unknown as ReactEditor, range);
  } catch {
    return null;
  }
}

export function getOverlayPosition(
  editor: Editor,
  range: BaseRange,
  { xOffset, yOffset }: GetOverlayPositionOptions
): OverlayPosition {
  const [start, end] = Range.edges(range);
  const domRange = toDOMRangeSafe(editor, range);
  if (!domRange) {
    return { caretPosition: null, selectionRects: [] };
  }

  const selectionRects: SelectionRect[] = [];
  let caretPosition: CaretPosition | null = null;
  const isBackward = Range.isBackward(range);

  const re = editor as unknown as ReactEditor;
  const nodeIterator = Editor.nodes(editor, {
    at: range,
    match: (n) => Text.isText(n),
  });

  for (const [node, path] of nodeIterator) {
    let domNode: HTMLElement;
    try {
      domNode = ReactEditor.toDOMNode(re, node);
    } catch {
      continue;
    }
    if (!domNode.parentElement) continue;

    const isStartNode = Path.equals(path, start.path);
    const isEndNode = Path.equals(path, end.path);

    let clientRects: DOMRectList;
    if (isStartNode || isEndNode) {
      const nodeRange = document.createRange();
      nodeRange.selectNode(domNode);
      if (isStartNode) {
        nodeRange.setStart(domRange.startContainer, domRange.startOffset);
      }
      if (isEndNode) {
        nodeRange.setEnd(domRange.endContainer, domRange.endOffset);
      }
      clientRects = nodeRange.getClientRects();
    } else {
      clientRects = domNode.getClientRects();
    }

    const isCaret = isBackward ? isStartNode : isEndNode;

    for (let i = 0; i < clientRects.length; i++) {
      const rect = clientRects.item(i);
      if (!rect) continue;

      const top = rect.top - yOffset;
      const left = rect.left - xOffset;

      const isCaretRect =
        isCaret && (isBackward ? i === 0 : i === clientRects.length - 1);

      if (isCaretRect) {
        caretPosition = {
          height: rect.height,
          top,
          left:
            left +
            (isBackward || Range.isCollapsed(range) ? 0 : rect.width),
        };
      }

      selectionRects.push({
        width: rect.width,
        height: rect.height,
        top,
        left,
      });
    }
  }

  return { selectionRects, caretPosition };
}
