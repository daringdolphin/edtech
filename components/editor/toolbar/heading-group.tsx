/*
<ai_context>
Toolbar group for heading controls (H1, H2, H3).
</ai_context>
*/

"use client"

import type { Editor } from "@tiptap/react"
import { Heading1, Heading2, Heading3 } from "lucide-react"

import { ToolbarButton } from "./toolbar-button"

interface HeadingGroupProps {
  editor: Editor
}

export function HeadingGroup({ editor }: HeadingGroupProps) {
  return (
    <>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive("heading", { level: 1 })}
        tooltip="Heading 1"
      >
        <Heading1 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive("heading", { level: 2 })}
        tooltip="Heading 2"
      >
        <Heading2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive("heading", { level: 3 })}
        tooltip="Heading 3"
      >
        <Heading3 className="h-4 w-4" />
      </ToolbarButton>
    </>
  )
}

