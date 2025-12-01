/*
<ai_context>
Main TipTap worksheet editor component.
Provides a Notion-like editing experience for creating worksheets.
Supports question blocks with rich inline editing.
</ai_context>
*/

"use client"

import { useEditor, EditorContent, Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import Image from "@tiptap/extension-image"
import Dropcursor from "@tiptap/extension-dropcursor"
import Gapcursor from "@tiptap/extension-gapcursor"
import { useEffect, useCallback, useMemo, useRef } from "react"

import { EditorToolbar } from "./editor-toolbar"
import { Spacer, Logo, QuestionBlock } from "./extensions"
import { cn } from "@/lib/utils"
import type { SelectPaperBlock } from "@/db/schema"
import type {
  QuestionBlockDoc,
  QuestionBlockOverrides,
  QuestionType
} from "@/types"

interface WorksheetEditorProps {
  content?: Record<string, unknown>
  onUpdate?: (content: Record<string, unknown>) => void
  editable?: boolean
  className?: string
  placeholder?: string
  // Question block support
  paperId?: number
  questionBlocks?: SelectPaperBlock[]
  onAddQuestionBlock?: (questionType: QuestionType) => Promise<SelectPaperBlock | null>
  onQuestionBlockChange?: (blockId: number, blockDoc: QuestionBlockDoc) => void
  onQuestionBlockOverridesChange?: (
    blockId: number,
    overrides: Partial<QuestionBlockOverrides>
  ) => void
  onQuestionBlockDelete?: (blockId: number) => void
}

export function WorksheetEditor({
  content,
  onUpdate,
  editable = true,
  className,
  placeholder = "Start writing your worksheet...",
  paperId,
  questionBlocks = [],
  onAddQuestionBlock,
  onQuestionBlockChange,
  onQuestionBlockOverridesChange,
  onQuestionBlockDelete
}: WorksheetEditorProps) {
  // Create a map of blocks by ID for quick lookup
  const blocksById = useMemo(() => {
    const map = new Map<number, SelectPaperBlock>()
    questionBlocks.forEach(block => {
      map.set(block.id, block)
    })
    return map
  }, [questionBlocks])

  // Use refs for callbacks to prevent editor recreation on prop changes
  // This is critical because useEditor destroys/recreates the editor when dependencies change
  const blocksByIdRef = useRef(blocksById)
  const questionBlocksRef = useRef(questionBlocks)
  const onBlockChangeRef = useRef(onQuestionBlockChange)
  const onOverridesChangeRef = useRef(onQuestionBlockOverridesChange)
  const onBlockDeleteRef = useRef(onQuestionBlockDelete)
  const editorRef = useRef<Editor | null>(null)

  // Keep refs in sync with latest values
  useEffect(() => {
    blocksByIdRef.current = blocksById
    questionBlocksRef.current = questionBlocks
    onBlockChangeRef.current = onQuestionBlockChange
    onOverridesChangeRef.current = onQuestionBlockOverridesChange
    onBlockDeleteRef.current = onQuestionBlockDelete
  }, [blocksById, questionBlocks, onQuestionBlockChange, onQuestionBlockOverridesChange, onQuestionBlockDelete])

  // Stable callbacks that read from refs - these never change identity
  const getBlockById = useCallback(
    (blockId: number) => blocksByIdRef.current.get(blockId),
    []
  )

  const getDisplayNumber = useCallback(
    (blockId: number) => {
      const sortedBlocks = [...questionBlocksRef.current].sort(
        (a, b) => a.position - b.position
      )
      const index = sortedBlocks.findIndex(b => b.id === blockId)
      return index >= 0 ? `Q${index + 1}` : "Q"
    },
    []
  )

  const handleBlockChange = useCallback(
    (blockId: number, blockDoc: QuestionBlockDoc) => {
      onBlockChangeRef.current?.(blockId, blockDoc)
    },
    []
  )

  const handleOverridesChange = useCallback(
    (blockId: number, overrides: Partial<QuestionBlockOverrides>) => {
      onOverridesChangeRef.current?.(blockId, overrides)
    },
    []
  )

  const handleBlockDelete = useCallback(
    (blockId: number) => {
      onBlockDeleteRef.current?.(blockId)
    },
    []
  )

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
      Logo,
      QuestionBlock.configure({
        getBlockById,
        onBlockChange: handleBlockChange,
        onOverridesChange: handleOverridesChange,
        onBlockDelete: handleBlockDelete,
        getDisplayNumber
      })
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
      const doc = editor.getJSON()
      const normalizedDoc = JSON.parse(JSON.stringify(doc))
      onUpdate?.(normalizedDoc)
    }
  }, [])

  // Keep editor ref in sync for use in async operations
  useEffect(() => {
    editorRef.current = editor
  }, [editor])

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

  // Handle adding a question block
  const handleAddQuestionBlock = useCallback(
    async (questionType: QuestionType) => {
      if (!editor || !onAddQuestionBlock) return

      try {
        const newBlock = await onAddQuestionBlock(questionType)
        if (newBlock) {
          // Use editorRef to get the current editor instance after async operation
          // This ensures we have the latest editor even if React re-rendered
          const currentEditor = editorRef.current

          // Check if editor is still valid after the async operation
          if (!currentEditor || currentEditor.isDestroyed) {
            console.warn("Editor is not available after async operation")
            return
          }

          // Insert the question block at the current cursor position
          currentEditor
            .chain()
            .focus()
            .insertQuestionBlock({
              blockId: newBlock.id,
              questionItemId: newBlock.questionItemId
            })
            .run()
        }
      } catch (error) {
        console.error("Error adding question block:", error)
      }
    },
    [editor, onAddQuestionBlock]
  )

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {editable && (
        <EditorToolbar
          editor={editor}
          onAddQuestionBlock={onAddQuestionBlock ? handleAddQuestionBlock : undefined}
        />
      )}

      <div className="rounded-lg border bg-card">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

export default WorksheetEditor

