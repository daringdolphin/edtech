/*
<ai_context>
Toolbar group for block elements (divider, spacer).
</ai_context>
*/

"use client"

import type { Editor } from "@tiptap/react"
import { Minus, Space } from "lucide-react"

import { ToolbarButton } from "./toolbar-button"

interface BlocksGroupProps {
  editor: Editor
}

export function BlocksGroup({ editor }: BlocksGroupProps) {
  return (
    <>
      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        tooltip="Divider"
      >
        <Minus className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setSpacer({ height: 32 }).run()}
        tooltip="Spacer"
      >
        <Space className="h-4 w-4" />
      </ToolbarButton>
    </>
  )
}

