import React, { type CSSProperties, type PropsWithChildren, useRef } from "react";
import type { ReactEditor } from "slate-react";

import type { LoroEditor } from "../plugins/with-loro";
import type { LoroPresenceEditor } from "../plugins/with-loro-presence";
import { useOverlayPositions, type CursorOverlayData } from "./useOverlayPositions";

type LoroPresenceEditorFull = LoroEditor & LoroPresenceEditor & ReactEditor;

function RemoteCaret({ data }: { data: CursorOverlayData }) {
  if (!data.caretPosition) return null;

  const name = data.user?.name ?? data.peer.slice(0, 8);

  const barStyle: CSSProperties = {
    position: "absolute",
    width: 2,
    backgroundColor: data.color,
    top: data.caretPosition.top,
    left: data.caretPosition.left,
    height: data.caretPosition.height,
  };

  const labelStyle: CSSProperties = {
    position: "absolute",
    top: -2,
    left: 0,
    transform: "translateY(-100%)",
    backgroundColor: data.color,
    color: "#fff",
    fontSize: "0.7em",
    lineHeight: 1.2,
    padding: "1px 5px",
    borderRadius: "3px 3px 3px 0",
    whiteSpace: "nowrap",
    zIndex: 10,
  };

  return (
    <div style={barStyle}>
      <span style={labelStyle}>{name}</span>
    </div>
  );
}

function RemoteSelectionRects({ data }: { data: CursorOverlayData }) {
  if (data.selectionRects.length === 0) return null;

  return (
    <>
      {data.selectionRects.map((rect, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            backgroundColor: `color-mix(in srgb, ${data.color} 30%, transparent)`,
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          }}
        />
      ))}
    </>
  );
}

const overlayStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
  zIndex: 1,
};

export function CursorOverlay({
  editor,
  children,
}: PropsWithChildren<{ editor: LoroPresenceEditorFull }>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cursors = useOverlayPositions(editor, containerRef);

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      {children}
      <div style={overlayStyle}>
        {cursors.map((cursor) => (
          <React.Fragment key={cursor.peer}>
            <RemoteSelectionRects data={cursor} />
            <RemoteCaret data={cursor} />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
