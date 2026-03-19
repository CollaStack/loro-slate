import { LoroList, LoroMap, LoroText, type LoroDoc } from 'loro-crdt'
import { type Path } from 'slate'

export function getLoroNode(doc: LoroDoc, path: Path): LoroMap {
  let list: LoroList = doc.getList('children')
  let node!: LoroMap
  for (let i = 0; i < path.length; i++) {
    node = list.get(path[i]!) as LoroMap
    if (i < path.length - 1) {
      list = node.get('children') as unknown as LoroList
    }
  }
  return node
}

export function getLoroText(doc: LoroDoc, path: Path): LoroText {
  return getLoroNode(doc, path).get('text') as unknown as LoroText
}

export function getLoroParentList(doc: LoroDoc, path: Path): LoroList {
  if (path.length <= 1) return doc.getList('children')
  const parentNode = getLoroNode(doc, path.slice(0, -1))
  return parentNode.get('children') as unknown as LoroList
}

export function safeGet(map: LoroMap, key: string): unknown {
  try {
    return map.get(key)
  } catch {
    return undefined
  }
}
