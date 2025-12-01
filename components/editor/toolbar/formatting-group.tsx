/*
<ai_context>
Toolbar group for text formatting controls (bold, italic, strikethrough).
</ai_context>
*/

"use client"

import type { Editor } from "@tiptap/react"
import { Bold, Italic, Strikethrough } from "lucide-react"

import { ToolbarButton } from "./toolbar-button"

interface FormattingGroupProps {
  editor: Editor
}

export function FormattingGroup({ editor }: FormattingGroupProps) {
  return (
    <>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
        tooltip="Bold"
      >
        <Bold className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
        tooltip="Italic"
      >
        <Italic className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive("strike")}
        tooltip="Strikethrough"
      >
        <Strikethrough className="h-4 w-4" />
      </ToolbarButton>
    </>
  )
}

