/*
<ai_context>
Main TipTap worksheet editor component.
Provides a Notion-like editing experience for creating worksheets.
Composes EditorProvider, EditorToolbar, and EditorContent.
</ai_context>
*/

"use client"

import { EditorContent } from "@tiptap/react"

import { EditorProvider, useEditorContext } from "./core"
import { EditorToolbar } from "./toolbar"
import { cn } from "@/lib/utils"

import type { SelectPaperBlock } from "@/db/schema"
import type {
  QuestionBlockDoc,
  QuestionBlockOverrides,
  QuestionType
} from "@/types"

export interface WorksheetEditorProps {
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

/**
 * Inner editor component that consumes the editor context.
 */
function EditorShell({
  className,
  editable
}: {
  className?: string
  editable: boolean
}) {
  const { editor } = useEditorContext()

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {editable && <EditorToolbar />}

      <div className="rounded-lg border bg-card">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

/**
 * WorksheetEditor provides a complete editing experience for worksheets.
 * 
 * Features:
 * - Rich text editing (headings, lists, formatting)
 * - Question blocks (MCQ, short answer, structured, essay)
 * - Media insertion (images, logos)
 * - Spacers and dividers
 * 
 * @example
 * ```tsx
 * <WorksheetEditor
 *   content={paper.content}
 *   onUpdate={handleContentUpdate}
 *   questionBlocks={blocks}
 *   onAddQuestionBlock={handleAddBlock}
 *   onQuestionBlockChange={handleBlockChange}
 * />
 * ```
 */
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
  return (
    <EditorProvider
      content={content}
      onUpdate={onUpdate}
      editable={editable}
      placeholder={placeholder}
      paperId={paperId}
      questionBlocks={questionBlocks}
      onAddQuestionBlock={onAddQuestionBlock}
      onQuestionBlockChange={onQuestionBlockChange}
      onQuestionBlockOverridesChange={onQuestionBlockOverridesChange}
      onQuestionBlockDelete={onQuestionBlockDelete}
    >
      <EditorShell className={className} editable={editable} />
    </EditorProvider>
  )
}

export default WorksheetEditor
