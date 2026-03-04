import { type RenderLeafProps } from "slate-react";

export function renderLeaf({ attributes, children, leaf }: RenderLeafProps) {
  if (leaf.bold) children = <strong>{children}</strong>;
  if (leaf.italic) children = <em>{children}</em>;
  if (leaf.underline) children = <u>{children}</u>;
  if (leaf.strikethrough) children = <s>{children}</s>;
  if (leaf.code)
    children = (
      <code
        style={{
          background: "#f6f8fa",
          borderRadius: 3,
          padding: "2px 4px",
          fontSize: "0.9em",
          fontFamily: "monospace",
        }}
      >
        {children}
      </code>
    );

  const tokenColor = (leaf as unknown as Record<string, unknown>)[
    "token-color"
  ] as string | undefined;
  if (tokenColor) {
    children = <span style={{ color: tokenColor }}>{children}</span>;
  }

  return <span {...attributes}>{children}</span>;
}
