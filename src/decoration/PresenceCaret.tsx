import type { CursorUser } from "../plugins/with-loro-presence";
import { peerToColor } from "./color-utils";

export function PresenceCaret({
  peer,
  user,
}: {
  peer: string;
  user?: CursorUser;
}) {
  const color = user?.color ?? peerToColor(peer);
  const name = user?.name ?? peer.slice(0, 8);

  return (
    <span
      contentEditable={false}
      style={{
        position: "relative",
        display: "inline-block",
        width: 0,
        // height: 1lh makes bottom:"100%" correctly resolve to the top of the
        // current line rather than the baseline (which happens with height: 0).
        height: "1lh",
        verticalAlign: "top",
        userSelect: "none",
        pointerEvents: "none",
      }}
    >
      {/* Vertical cursor bar */}
      <span
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: -1,
          borderLeft: `2px solid ${color}`,
        }}
      />
      {/* Name label — anchored to top of line, floats above without shifting layout */}
      <span
        style={{
          position: "absolute",
          bottom: "100%",
          left: -1,
          backgroundColor: color,
          color: "#fff",
          fontSize: "0.7em",
          lineHeight: 1.2,
          padding: "1px 5px",
          borderRadius: "3px 3px 3px 0",
          whiteSpace: "nowrap",
          zIndex: 10,
        }}
      >
        {name}
      </span>
    </span>
  );
}
