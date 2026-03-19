import { useSlate } from 'slate-react'
import {
  Editor,
  Transforms,
  Element as SlateElement,
  type Descendant,
} from 'slate'
import { LIST_TYPES, type MarkFormat, type BlockFormat } from './types.ts'

// ── mark helpers ───────────────────────────────────────────

function isMarkActive(editor: Editor, format: MarkFormat): boolean {
  const marks = Editor.marks(editor) as Record<string, unknown> | null
  return marks ? marks[format] === true : false
}

function toggleMark(editor: Editor, format: MarkFormat) {
  if (isMarkActive(editor, format)) {
    Editor.removeMark(editor, format)
  } else {
    Editor.addMark(editor, format, true)
  }
}

// ── block helpers ──────────────────────────────────────────

function isBlockActive(editor: Editor, format: BlockFormat): boolean {
  const [match] = Editor.nodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      (n as { type?: string }).type === format,
  })
  return !!match
}

function toggleBlock(editor: Editor, format: BlockFormat) {
  const isActive = isBlockActive(editor, format)
  const isList = (LIST_TYPES as readonly string[]).includes(format)

  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      (LIST_TYPES as readonly string[]).includes(
        (n as { type?: string }).type ?? '',
      ),
    split: true,
  })

  const newType = isActive ? 'paragraph' : isList ? 'list-item' : format
  Transforms.setNodes(editor, { type: newType } as Partial<SlateElement>)

  if (!isActive && isList) {
    Transforms.wrapNodes(editor, {
      type: format,
      children: [],
    } as SlateElement)
  }
}

// ── insert table ───────────────────────────────────────────

function insertTable(editor: Editor, rows = 3, cols = 3) {
  const cell = (): Descendant => ({
    type: 'table-cell',
    children: [{ text: '' }],
  })
  const row = (): Descendant => ({
    type: 'table-row',
    children: Array.from({ length: cols }, cell),
  })
  const table: Descendant = {
    type: 'table',
    children: Array.from({ length: rows }, row),
  }

  Transforms.insertNodes(editor, table)
}

// ── heading toggle ─────────────────────────────────────────

function toggleHeading(editor: Editor, level: 1 | 2 | 3) {
  const [match] = Editor.nodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      (n as { type?: string }).type === 'heading' &&
      (n as { level?: number }).level === level,
  })

  if (match) {
    Transforms.setNodes(editor, { type: 'paragraph' } as Partial<SlateElement>)
  } else {
    Transforms.setNodes(editor, {
      type: 'heading',
      level,
    } as Partial<SlateElement>)
  }
}

// ── styles ─────────────────────────────────────────────────

const toolbarStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 2,
  padding: '6px 8px',
  borderBottom: '1px solid #d0d7de',
  background: '#f6f8fa',
}

const btnBase: React.CSSProperties = {
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  padding: '4px 8px',
  borderRadius: 4,
  fontSize: 13,
  lineHeight: 1,
  fontFamily: 'inherit',
}

function btnStyle(active: boolean): React.CSSProperties {
  return {
    ...btnBase,
    fontWeight: active ? 700 : 400,
    color: active ? '#0969da' : '#24292f',
    background: active ? '#ddf4ff' : 'transparent',
  }
}

const sepStyle: React.CSSProperties = {
  width: 1,
  height: 20,
  background: '#d0d7de',
  alignSelf: 'center',
  margin: '0 4px',
}

// ── Toolbar component ──────────────────────────────────────

const MARKS: { format: MarkFormat; label: string }[] = [
  { format: 'bold', label: 'B' },
  { format: 'italic', label: 'I' },
  { format: 'underline', label: 'U' },
  { format: 'strikethrough', label: 'S' },
  { format: 'code', label: '<>' },
]

export function Toolbar() {
  const editor = useSlate()

  return (
    <div style={toolbarStyle}>
      {MARKS.map(({ format, label }) => (
        <button
          key={format}
          type="button"
          style={{
            ...btnStyle(isMarkActive(editor, format)),
            ...(format === 'bold' ? { fontWeight: 700 } : {}),
            ...(format === 'italic' ? { fontStyle: 'italic' } : {}),
            ...(format === 'underline' ? { textDecoration: 'underline' } : {}),
            ...(format === 'strikethrough'
              ? { textDecoration: 'line-through' }
              : {}),
            ...(format === 'code' ? { fontFamily: 'monospace' } : {}),
          }}
          onMouseDown={(e) => {
            e.preventDefault()
            toggleMark(editor, format)
          }}
        >
          {label}
        </button>
      ))}

      <span style={sepStyle} />

      {([1, 2, 3] as const).map((level) => (
        <button
          key={level}
          type="button"
          style={btnStyle(
            (() => {
              const [m] = Editor.nodes(editor, {
                match: (n) =>
                  !Editor.isEditor(n) &&
                  SlateElement.isElement(n) &&
                  (n as { type?: string }).type === 'heading' &&
                  (n as { level?: number }).level === level,
              })
              return !!m
            })(),
          )}
          onMouseDown={(e) => {
            e.preventDefault()
            toggleHeading(editor, level)
          }}
        >
          H{level}
        </button>
      ))}

      <span style={sepStyle} />

      <button
        type="button"
        style={btnStyle(isBlockActive(editor, 'blockquote'))}
        onMouseDown={(e) => {
          e.preventDefault()
          toggleBlock(editor, 'blockquote')
        }}
      >
        Quote
      </button>

      <button
        type="button"
        style={btnStyle(isBlockActive(editor, 'code-block'))}
        onMouseDown={(e) => {
          e.preventDefault()
          toggleBlock(editor, 'code-block')
        }}
      >
        Code
      </button>

      <button
        type="button"
        style={btnStyle(isBlockActive(editor, 'bulleted-list'))}
        onMouseDown={(e) => {
          e.preventDefault()
          toggleBlock(editor, 'bulleted-list')
        }}
      >
        • List
      </button>

      <button
        type="button"
        style={btnStyle(isBlockActive(editor, 'numbered-list'))}
        onMouseDown={(e) => {
          e.preventDefault()
          toggleBlock(editor, 'numbered-list')
        }}
      >
        1. List
      </button>

      <span style={sepStyle} />

      <button
        type="button"
        style={btnBase}
        onMouseDown={(e) => {
          e.preventDefault()
          insertTable(editor)
        }}
      >
        ⊞ Table
      </button>
    </div>
  )
}
