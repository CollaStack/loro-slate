import type { BaseEditor, BaseElement, BaseText, Descendant } from 'slate'
import type { ReactEditor } from 'slate-react'
import type { LoroEditor } from '../src/index.ts'

// ── custom element types ───────────────────────────────────

export type ParagraphElement = { type: 'paragraph'; children: Descendant[] }
export type HeadingElement = {
  type: 'heading'
  level: 1 | 2 | 3
  children: Descendant[]
}
export type BlockquoteElement = { type: 'blockquote'; children: Descendant[] }
export type CodeBlockElement = {
  type: 'code-block'
  language: string
  children: Descendant[]
}
export type BulletedListElement = {
  type: 'bulleted-list'
  children: Descendant[]
}
export type NumberedListElement = {
  type: 'numbered-list'
  children: Descendant[]
}
export type ListItemElement = { type: 'list-item'; children: Descendant[] }
export type TableElement = { type: 'table'; children: Descendant[] }
export type TableRowElement = { type: 'table-row'; children: Descendant[] }
export type TableCellElement = { type: 'table-cell'; children: Descendant[] }

export type CustomElement =
  | ParagraphElement
  | HeadingElement
  | BlockquoteElement
  | CodeBlockElement
  | BulletedListElement
  | NumberedListElement
  | ListItemElement
  | TableElement
  | TableRowElement
  | TableCellElement

// ── custom text / marks ────────────────────────────────────

export type FormattedText = BaseText & {
  bold?: true
  italic?: true
  underline?: true
  strikethrough?: true
  code?: true
}

// ── module augmentation ────────────────────────────────────

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & LoroEditor
    Element: CustomElement
    Text: FormattedText
  }
}

// ── type guards ────────────────────────────────────────────

export const isBlockType = (
  el: BaseElement & { type?: string },
  type: string,
): boolean => el.type === type

export const LIST_TYPES = ['bulleted-list', 'numbered-list'] as const
export const TABLE_TYPES = ['table', 'table-row', 'table-cell'] as const

export type MarkFormat =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikethrough'
  | 'code'

export type BlockFormat = CustomElement['type']
