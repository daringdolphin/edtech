/*
<ai_context>
Toolbar group for list and quote controls.
</ai_context>
*/

"use client"

import type { Editor } from "@tiptap/react"
import { List, ListOrdered, Quote } from "lucide-react"

import { ToolbarButton } from "./toolbar-button"

interface ListGroupProps {
  editor: Editor
}

export function ListGroup({ editor }: ListGroupProps) {
  return (
    <>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive("bulletList")}
        tooltip="Bullet List"
      >
        <List className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive("orderedList")}
        tooltip="Numbered List"
      >
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive("blockquote")}
        tooltip="Quote"
      >
        <Quote className="h-4 w-4" />
      </ToolbarButton>
    </>
  )
}

