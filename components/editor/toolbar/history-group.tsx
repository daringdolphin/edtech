/*
<ai_context>
Toolbar group for undo/redo controls.
</ai_context>
*/

"use client"

import type { Editor } from "@tiptap/react"
import { Undo, Redo } from "lucide-react"

import { ToolbarButton } from "./toolbar-button"

interface HistoryGroupProps {
  editor: Editor
}

export function HistoryGroup({ editor }: HistoryGroupProps) {
  return (
    <>
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        tooltip="Undo"
      >
        <Undo className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        tooltip="Redo"
      >
        <Redo className="h-4 w-4" />
      </ToolbarButton>
    </>
  )
}

