import { Prism, normalizeTokens } from "prism-react-renderer";
import { type NodeEntry, Text, Node, type Range, Element } from "slate";
import type { CodeBlockElement } from "./types.ts";

const TOKEN_COLORS: Record<string, string> = {
  comment: "#6a737d",
  prolog: "#6a737d",
  doctype: "#6a737d",
  cdata: "#6a737d",
  punctuation: "#24292e",
  property: "#005cc5",
  tag: "#22863a",
  boolean: "#005cc5",
  number: "#005cc5",
  constant: "#005cc5",
  symbol: "#005cc5",
  deleted: "#b31d28",
  selector: "#22863a",
  "attr-name": "#6f42c1",
  string: "#032f62",
  char: "#032f62",
  builtin: "#6f42c1",
  inserted: "#22863a",
  operator: "#d73a49",
  entity: "#005cc5",
  url: "#032f62",
  keyword: "#d73a49",
  atrule: "#d73a49",
  "attr-value": "#032f62",
  function: "#6f42c1",
  "class-name": "#6f42c1",
  regex: "#032f62",
  important: "#d73a49",
  variable: "#e36209",
};

export function makeDecorate(editor: { children: Node[] }) {
  return ([node, path]: NodeEntry): Range[] => {
    if (!Text.isText(node)) return [];

    const ancestors = Array.from(Node.ancestors(editor as Node, path));
    const codeBlockEntry = ancestors.find(
      ([n]) =>
        Element.isElement(n) &&
        (n as { type?: string }).type === "code-block"
    );
    if (!codeBlockEntry) return [];

    const codeBlock = codeBlockEntry[0] as CodeBlockElement;
    const lang = codeBlock.language || "javascript";
    const grammar = Prism.languages[lang];
    if (!grammar) return [];

    const textContent = node.text;
    if (!textContent) return [];

    const tokens = Prism.tokenize(textContent, grammar);
    const normalized = normalizeTokens(tokens);
    const ranges: Range[] = [];

    let offset = 0;
    for (const line of normalized) {
      for (const token of line) {
        const length = token.content.length;
        if (token.types.length > 0 && !(token.types.length === 1 && token.types[0] === "plain")) {
          const tokenType = token.types[token.types.length - 1];
          const color = TOKEN_COLORS[tokenType];
          if (color) {
            ranges.push({
              anchor: { path, offset },
              focus: { path, offset: offset + length },
              "token-color": color,
            } as Range & { "token-color": string });
          }
        }
        offset += length;
      }
    }

    return ranges;
  };
}
