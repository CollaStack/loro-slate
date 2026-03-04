import type { RenderElementProps } from "slate-react";
import type { HeadingElement, CodeBlockElement } from "./types.ts";
import { CodeBlock } from "./CodeBlock.tsx";

export function renderElement(props: RenderElementProps) {
  const { attributes, children, element } = props;
  switch (element.type) {
    case "heading": {
      const el = element as HeadingElement;
      const Tag = `h${el.level}` as "h1" | "h2" | "h3";
      return <Tag {...attributes}>{children}</Tag>;
    }
    case "blockquote":
      return (
        <blockquote
          {...attributes}
          style={{
            borderLeft: "3px solid #d0d7de",
            paddingLeft: 16,
            color: "#656d76",
            margin: "8px 0",
          }}
        >
          {children}
        </blockquote>
      );
    case "code-block":
      return (
        <CodeBlock attributes={attributes} element={element as CodeBlockElement}>
          {children}
        </CodeBlock>
      );
    case "bulleted-list":
      return (
        <ul {...attributes} style={{ paddingLeft: 24 }}>
          {children}
        </ul>
      );
    case "numbered-list":
      return (
        <ol {...attributes} style={{ paddingLeft: 24 }}>
          {children}
        </ol>
      );
    case "list-item":
      return <li {...attributes}>{children}</li>;
    case "table":
      return (
        <table
          {...attributes}
          style={{
            borderCollapse: "collapse",
            width: "100%",
            margin: "8px 0",
          }}
        >
          <tbody>{children}</tbody>
        </table>
      );
    case "table-row":
      return <tr {...attributes}>{children}</tr>;
    case "table-cell":
      return (
        <td
          {...attributes}
          style={{
            border: "1px solid #d0d7de",
            padding: "6px 10px",
            minWidth: 60,
          }}
        >
          {children}
        </td>
      );
    default:
      return <p {...attributes}>{children}</p>;
  }
}
