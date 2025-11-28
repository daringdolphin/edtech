/*
<ai_context>
Main TipTap worksheet editor component.
Provides a Notion-like editing experience for creating worksheets.
</ai_context>
*/

"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import Image from "@tiptap/extension-image"
import Dropcursor from "@tiptap/extension-dropcursor"
import Gapcursor from "@tiptap/extension-gapcursor"
import { useEffect, useCallback } from "react"

import { EditorToolbar } from "./editor-toolbar"
import { Spacer, Logo } from "./extensions"
import { cn } from "@/lib/utils"

interface WorksheetEditorProps {
  content?: Record<string, unknown>
  onUpdate?: (content: Record<string, unknown>) => void
  editable?: boolean
  className?: string
  placeholder?: string
}

export function WorksheetEditor({
  content,
  onUpdate,
  editable = true,
  className,
  placeholder = "Start writing your worksheet..."
}: WorksheetEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        },
        horizontalRule: {
          HTMLAttributes: {
            class: "my-4 border-t border-border"
          }
        }
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass:
          "before:content-[attr(data-placeholder)] before:text-muted-foreground before:float-left before:h-0 before:pointer-events-none"
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-lg max-w-full h-auto my-4"
        },
        allowBase64: true
      }),
      Dropcursor.configure({
        color: "hsl(var(--primary))",
        width: 2
      }),
      Gapcursor,
      Spacer,
      Logo
    ],
    content: content || {
      type: "doc",
      content: [
        {
          type: "paragraph"
        }
      ]
    },
    editable,
    editorProps: {
      attributes: {
        class: cn(
          "focus:outline-none min-h-[500px] px-6 py-4",
          "text-foreground leading-relaxed"
        )
      }
    },
    onUpdate: ({ editor }) => {
      if (onUpdate) {
        onUpdate(editor.getJSON())
      }
    }
  })

  // Update content when prop changes
  useEffect(() => {
    if (editor && content && !editor.isDestroyed) {
      const currentContent = JSON.stringify(editor.getJSON())
      const newContent = JSON.stringify(content)
      if (currentContent !== newContent) {
        editor.commands.setContent(content)
      }
    }
  }, [editor, content])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (editor && !editor.isDestroyed) {
        editor.destroy()
      }
    }
  }, [editor])

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {editable && <EditorToolbar editor={editor} />}

      <div className="rounded-lg border bg-card">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

export default WorksheetEditor

