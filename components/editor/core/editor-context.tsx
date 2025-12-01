/*
<ai_context>
React context for the worksheet editor.
Provides access to the TipTap editor instance and question block callbacks.
Separates editor state management from rendering concerns.
</ai_context>
*/

"use client"

import { createContext, useContext } from "react"
import type { Editor } from "@tiptap/react"
import type { SelectPaperBlock } from "@/db/schema"
import type {
  QuestionBlockDoc,
  QuestionBlockOverrides,
  QuestionType
} from "@/types"

/**
 * Callbacks for managing question blocks within the editor.
 */
export interface QuestionBlockCallbacks {
  /** Get block data by ID */
  getBlockById: (blockId: number) => SelectPaperBlock | undefined
  /** Get display number for a block (e.g., "Q1", "Q2") */
  getDisplayNumber: (blockId: number) => string
  /** Called when block content changes */
  onBlockChange: (blockId: number, blockDoc: QuestionBlockDoc) => void
  /** Called when block overrides change */
  onOverridesChange: (blockId: number, overrides: Partial<QuestionBlockOverrides>) => void
  /** Called when a block is deleted */
  onBlockDelete: (blockId: number) => void
  /** Add a new question block */
  onAddQuestionBlock?: (questionType: QuestionType) => Promise<SelectPaperBlock | null>
}

/**
 * Editor context value containing the editor instance and callbacks.
 */
export interface EditorContextValue {
  /** The TipTap editor instance */
  editor: Editor | null
  /** Whether the editor is in editable mode */
  editable: boolean
  /** Paper ID for the current worksheet */
  paperId?: number
  /** Question block callbacks (only present when question blocks are enabled) */
  questionBlockCallbacks?: QuestionBlockCallbacks
}

const EditorContext = createContext<EditorContextValue | null>(null)

/**
 * Hook to access the editor context.
 * Must be used within an EditorProvider.
 */
export function useEditorContext(): EditorContextValue {
  const context = useContext(EditorContext)
  if (!context) {
    throw new Error("useEditorContext must be used within an EditorProvider")
  }
  return context
}

/**
 * Hook to access just the editor instance.
 * Returns null if editor is not ready.
 */
export function useEditor(): Editor | null {
  const { editor } = useEditorContext()
  return editor
}

/**
 * Hook to access question block callbacks.
 * Returns undefined if question blocks are not enabled.
 */
export function useQuestionBlockCallbacks(): QuestionBlockCallbacks | undefined {
  const { questionBlockCallbacks } = useEditorContext()
  return questionBlockCallbacks
}

export { EditorContext }

