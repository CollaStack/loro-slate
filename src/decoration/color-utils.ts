const PALETTE = [
  "#e03131",
  "#2f9e44",
  "#1971c2",
  "#ae3ec9",
  "#f76707",
  "#0c8599",
  "#c2255c",
  "#5c7cfa",
];

/** Deterministic color for a peer that didn't supply one. */
export function peerToColor(peer: string): string {
  let hash = 0;
  for (let i = 0; i < peer.length; i++) {
    hash = (hash * 31 + peer.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length]!;
}

export function withAlpha(hex: string, alpha: number): string {
  const full =
    hex.length === 4
      ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
      : hex;
  const r = parseInt(full.slice(1, 3), 16);
  const g = parseInt(full.slice(3, 5), 16);
  const b = parseInt(full.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
