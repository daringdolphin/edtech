/*
<ai_context>
Shared helper utilities for manipulating TipTap image nodes.
Used by the worksheet editor and question block rich text areas
to swap placeholder sources once uploads finish or clean up failed inserts.
</ai_context>
*/

import type { Editor } from "@tiptap/react"

type ImagePredicate = (attrs: Record<string, any>) => boolean
type ImageAttrsUpdater = (attrs: Record<string, any>) => Record<string, any>

function updateImageNode(
  editor: Editor | null,
  predicate: ImagePredicate,
  updater: ImageAttrsUpdater
): boolean {
  if (!editor || editor.isDestroyed) {
    return false
  }

  return editor.commands.command(({ tr, state, dispatch }) => {
    let updated = false

    state.doc.descendants((node, pos) => {
      if (updated) {
        return false
      }

      if (node.type.name !== "image") {
        return undefined
      }

      if (!predicate(node.attrs)) {
        return undefined
      }

      tr.setNodeMarkup(pos, undefined, updater({ ...node.attrs }))
      updated = true
      return false
    })

    if (!updated) {
      return false
    }

    tr.setMeta("addToHistory", false)
    dispatch?.(tr)
    return true
  })
}

export function updateImageAttrsByUploadKey(
  editor: Editor | null,
  uploadKey: string,
  updater: ImageAttrsUpdater
): boolean {
  return updateImageNode(
    editor,
    attrs => typeof attrs?.dataUploadKey === "string" && attrs.dataUploadKey === uploadKey,
    updater
  )
}

export function removeImageByUploadKey(editor: Editor | null, uploadKey: string): boolean {
  if (!editor || editor.isDestroyed) {
    return false
  }

  return editor.commands.command(({ tr, state, dispatch }) => {
    let removed = false

    state.doc.descendants((node, pos) => {
      if (removed) {
        return false
      }

      if (
        node.type.name === "image" &&
        typeof node.attrs?.dataUploadKey === "string" &&
        node.attrs.dataUploadKey === uploadKey
      ) {
        tr.delete(pos, pos + node.nodeSize)
        removed = true
      }

      return removed ? false : undefined
    })

    if (!removed) {
      return false
    }

    tr.setMeta("addToHistory", false)
    dispatch?.(tr)
    return true
  })
}
