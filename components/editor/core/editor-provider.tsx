/*
<ai_context>
EditorProvider component that owns the TipTap useEditor setup.
Centralizes editor configuration and provides context to child components.
Uses refs for callbacks to prevent editor recreation on prop changes.
</ai_context>
*/

"use client"

import { useEditor as useTipTapEditor } from "@tiptap/react"
import { useEffect, useCallback, useMemo, useRef } from "react"

import { buildWorksheetExtensions } from "../extensions/registry"
import { EditorContext, type QuestionBlockCallbacks } from "./editor-context"
import { normalizeEditorDoc } from "@/lib/editor"
import type { SelectPaperBlock } from "@/db/schema"
import type {
  QuestionBlockDoc,
  QuestionBlockOverrides,
  QuestionType
} from "@/types"

export interface EditorProviderProps {
  children: React.ReactNode
  /** Initial content for the editor */
  content?: Record<string, unknown>
  /** Called when editor content changes */
  onUpdate?: (content: Record<string, unknown>) => void
  /** Whether the editor is editable */
  editable?: boolean
  /** Placeholder text for empty editor */
  placeholder?: string
  /** Paper ID for question block support */
  paperId?: number
  /** Question blocks data */
  questionBlocks?: SelectPaperBlock[]
  /** Add a new question block */
  onAddQuestionBlock?: (questionType: QuestionType) => Promise<SelectPaperBlock | null>
  /** Called when block content changes */
  onQuestionBlockChange?: (blockId: number, blockDoc: QuestionBlockDoc) => void
  /** Called when block overrides change */
  onQuestionBlockOverridesChange?: (blockId: number, overrides: Partial<QuestionBlockOverrides>) => void
  /** Called when a block is deleted */
  onQuestionBlockDelete?: (blockId: number) => void
}

export function EditorProvider({
  children,
  content,
  onUpdate,
  editable = true,
  placeholder = "Start writing your worksheet...",
  paperId,
  questionBlocks = [],
  onAddQuestionBlock,
  onQuestionBlockChange,
  onQuestionBlockOverridesChange,
  onQuestionBlockDelete
}: EditorProviderProps) {
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

  // Build extensions with question block support
  const extensions = useMemo(
    () =>
      buildWorksheetExtensions({
        placeholder,
        questionBlock: {
          getBlockById,
          onBlockChange: handleBlockChange,
          onOverridesChange: handleOverridesChange,
          onBlockDelete: handleBlockDelete,
          getDisplayNumber
        }
      }),
    [placeholder, getBlockById, handleBlockChange, handleOverridesChange, handleBlockDelete, getDisplayNumber]
  )

  const editor = useTipTapEditor({
    immediatelyRender: false,
    extensions,
    content: content || {
      type: "doc",
      content: [{ type: "paragraph" }]
    },
    editable,
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-[500px] px-6 py-4 text-foreground leading-relaxed"
      }
    },
    onUpdate: ({ editor }) => {
      const doc = editor.getJSON()
      const normalizedDoc = normalizeEditorDoc(doc)
      onUpdate?.(normalizedDoc)
    }
  }, [])

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

  // Build question block callbacks object
  const questionBlockCallbacks: QuestionBlockCallbacks | undefined = useMemo(() => {
    if (!onAddQuestionBlock) return undefined
    return {
      getBlockById,
      getDisplayNumber,
      onBlockChange: handleBlockChange,
      onOverridesChange: handleOverridesChange,
      onBlockDelete: handleBlockDelete,
      onAddQuestionBlock
    }
  }, [
    onAddQuestionBlock,
    getBlockById,
    getDisplayNumber,
    handleBlockChange,
    handleOverridesChange,
    handleBlockDelete
  ])

  const contextValue = useMemo(
    () => ({
      editor,
      editable,
      paperId,
      questionBlockCallbacks
    }),
    [editor, editable, paperId, questionBlockCallbacks]
  )

  return (
    <EditorContext.Provider value={contextValue}>
      {children}
    </EditorContext.Provider>
  )
}

