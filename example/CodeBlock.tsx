import type { RenderElementProps } from 'slate-react'
import type { CodeBlockElement } from './types.ts'

export function CodeBlock({
  attributes,
  children,
  element,
}: {
  attributes: RenderElementProps['attributes']
  children: React.ReactNode
  element: CodeBlockElement
}) {
  return (
    <div
      {...attributes}
      style={{
        background: '#f6f8fa',
        borderRadius: 6,
        padding: '12px 16px',
        margin: '8px 0',
        fontFamily: '"SF Mono", Menlo, Consolas, monospace',
        fontSize: 13,
        lineHeight: 1.5,
        overflowX: 'auto',
        position: 'relative',
      }}
    >
      <span
        contentEditable={false}
        style={{
          position: 'absolute',
          top: 6,
          right: 10,
          fontSize: 11,
          color: '#8b949e',
          userSelect: 'none',
        }}
      >
        {element.language}
      </span>
      <pre style={{ margin: 0 }}>
        <code>{children}</code>
      </pre>
    </div>
  )
}
