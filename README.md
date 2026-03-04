# loro-slate

A [Slate](https://docs.slatejs.org/) plugin that integrates [Loro CRDT](https://loro.dev) to enable real-time collaborative editing.

## How it works

Slate's document tree is mirrored into a Loro document:

| Slate | Loro |
|---|---|
| `Editor.children` | `LoroList` (root `"children"`) |
| Element node | `LoroMap { type, children: LoroList, ... }` |
| Text node | `LoroMap { text: LoroText, bold?, italic?, ... }` |

Every local Slate operation is translated into a Loro mutation and committed. Remote Loro events (from other peers) are translated back into Slate operations and applied without re-triggering Loro writes.

## Installation

```bash
npm install loro-slate loro-crdt slate slate-react
```

## Usage

```ts
import { LoroDoc } from "loro-crdt";
import { createEditor } from "slate";
import { withReact } from "slate-react";
import { withLoro, syncSlateValueToLoro, loroDocToSlateValue } from "loro-slate";

const doc = new LoroDoc();
const editor = withLoro(withReact(createEditor()), { doc });

// Now you can init the doc data from remote snapshot or somewhere
// doc.import(snapshot)
```

Use `loroDocToSlateValue(doc)` to read the current document state back as a Slate value, and pass it as `initialValue` to `<Slate>`.

To sync between peers, forward `doc.subscribeLocalUpdates` bytes to remote peers and call `doc.import(bytes)` on receipt — Loro handles conflict resolution automatically.

## API

### `withLoro(editor, options)`

Wraps a Slate editor with Loro synchronization. Returns the editor extended with:

- `editor.doc` — the underlying `LoroDoc`
- `editor.disconnect()` — unsubscribes from Loro events

### `syncSlateValueToLoro(doc, value)`

Writes a Slate `Descendant[]` value into a `LoroDoc`. Use this once to initialize the document.

### `loroDocToSlateValue(doc)`

Reads a `LoroDoc` and returns the equivalent Slate `Descendant[]` value.

## Development

```bash
bun install
bun dev   # starts the demo app (two syncing editor peers)
```

## Peer dependencies

- `loro-crdt` ^1.10.6
- `slate` ^0.123.0
- `slate-react` ^0.123.0
