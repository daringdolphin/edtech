/*
<ai_context>
React NodeView component for rendering QuestionBlock nodes in TipTap.
Composes UI components and question type editors for rich editing experience.
Handles inline editing while maintaining the snapshot model.
</ai_context>
*/

"use client"

import { NodeViewWrapper, NodeViewProps } from "@tiptap/react"
import { useCallback, useState, useEffect, useMemo } from "react"

import { cn } from "@/lib/utils"
import { normalizeNumericId, extractPlainText } from "@/lib/editor"

import { BlockHeader, RichTextArea } from "../ui"
import {
  MCQEditor,
  StructuredEditor,
  ShortAnswerEditor,
  EssayEditor
} from "../question-types"

import type { SelectPaperBlock } from "@/db/schema"
import type {
  QuestionBlockDoc,
  QuestionBlockOverrides,
  MCQOption,
  QuestionBlockPart
} from "@/types"
import type { JSONContent } from "@tiptap/react"

interface QuestionBlockViewProps extends NodeViewProps {
  // These are passed via extension options
  getBlockById?: (blockId: number) => SelectPaperBlock | undefined
  onBlockChange?: (blockId: number, blockDoc: QuestionBlockDoc) => void
  onOverridesChange?: (
    blockId: number,
    overrides: Partial<QuestionBlockOverrides>
  ) => void
  onBlockDelete?: (blockId: number) => void
  getDisplayNumber?: (blockId: number) => string
}

export function QuestionBlockView({
  node,
  deleteNode,
  selected,
  extension
}: QuestionBlockViewProps) {
  const blockId = normalizeNumericId(node.attrs.blockId)

  // Get callbacks from extension options
  const options = extension.options as QuestionBlockViewProps
  const { getBlockById, onBlockChange, onOverridesChange, onBlockDelete, getDisplayNumber } =
    options

  // Get block data (safe to call even if blockId is null)
  const block = blockId !== null ? getBlockById?.(blockId) : undefined
  const blockDoc = block?.blockDoc as QuestionBlockDoc | undefined
  const overrides = block?.overrides as QuestionBlockOverrides | undefined

  // Local state for editing - ALL HOOKS MUST BE CALLED BEFORE ANY EARLY RETURNS
  const [localBlockDoc, setLocalBlockDoc] = useState<QuestionBlockDoc | null>(
    blockDoc || null
  )
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Sync with external block data
  useEffect(() => {
    if (blockDoc) {
      setLocalBlockDoc(blockDoc)
    }
  }, [blockDoc])

  // Get display number
  const displayNumber = useMemo(() => {
    if (blockId === null) return "Q"
    if (overrides?.displayNumber) return overrides.displayNumber
    return getDisplayNumber?.(blockId) || "Q"
  }, [overrides?.displayNumber, getDisplayNumber, blockId])

  // Extract stem text for display
  const stemText = useMemo(
    () => extractPlainText(localBlockDoc?.stem),
    [localBlockDoc?.stem]
  )

  // Handle stem change
  const handleStemChange = useCallback(
    (doc: JSONContent) => {
      if (!localBlockDoc || blockId === null) return

      const updated: QuestionBlockDoc = {
        ...localBlockDoc,
        stem: doc
      }
      setLocalBlockDoc(updated)
      onBlockChange?.(blockId, updated)
    },
    [localBlockDoc, blockId, onBlockChange]
  )

  // Handle marks change
  const handleMarksChange = useCallback(
    (marks: number) => {
      if (blockId === null) return
      onOverridesChange?.(blockId, { maxMarks: marks })
    },
    [blockId, onOverridesChange]
  )

  // Handle delete
  const handleDelete = useCallback(() => {
    if (blockId !== null) {
      onBlockDelete?.(blockId)
    }
    deleteNode()
  }, [blockId, onBlockDelete, deleteNode])

  // Handle MCQ options change
  const handleOptionsChange = useCallback(
    (options: MCQOption[]) => {
      if (!localBlockDoc || blockId === null) return

      const newDoc: QuestionBlockDoc = {
        ...localBlockDoc,
        options
      }
      setLocalBlockDoc(newDoc)
      onBlockChange?.(blockId, newDoc)
    },
    [localBlockDoc, blockId, onBlockChange]
  )

  // Handle parts change
  const handlePartsChange = useCallback(
    (parts: QuestionBlockPart[]) => {
      if (!localBlockDoc || blockId === null) return

      const newDoc: QuestionBlockDoc = {
        ...localBlockDoc,
        parts
      }
      setLocalBlockDoc(newDoc)
      onBlockChange?.(blockId, newDoc)
    },
    [localBlockDoc, blockId, onBlockChange]
  )

  // Early returns AFTER all hooks are called
  if (blockId === null) {
    return (
      <NodeViewWrapper className="question-block">
        <div className="flex flex-col gap-2 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 p-4 text-muted-foreground">
          <span className="text-sm">
            Question block reference is missing or invalid. Please delete this block and add it
            again.
          </span>
          <div>
            <button
              className="h-6 px-2 text-destructive hover:text-destructive text-sm"
              onClick={deleteNode}
            >
              Remove block
            </button>
          </div>
        </div>
      </NodeViewWrapper>
    )
  }

  // Loading state
  if (!block || !localBlockDoc) {
    return (
      <NodeViewWrapper className="question-block">
        <div className="flex items-center gap-2 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 p-4 text-muted-foreground">
          <span className="text-sm">Loading question block...</span>
        </div>
      </NodeViewWrapper>
    )
  }

  const questionType = localBlockDoc.questionType

  return (
    <NodeViewWrapper className="question-block">
      <div
        className={cn(
          "group relative rounded-lg border bg-card transition-colors",
          selected && "ring-2 ring-primary/50",
          "hover:border-muted-foreground/30"
        )}
      >
        <BlockHeader
          displayNumber={displayNumber}
          questionType={questionType}
          marks={overrides?.maxMarks ?? 1}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          onMarksChange={handleMarksChange}
          onDelete={handleDelete}
        />

        {/* Content Area */}
        {!isCollapsed && (
          <div className="p-4 space-y-4">
            {/* Question Stem */}
            <div className="space-y-1">
              <RichTextArea
                value={localBlockDoc.stem}
                onChange={handleStemChange}
                placeholder="Enter question text..."
                className="text-base"
                paperId={block.paperId}
              />
            </div>

            {/* Type-specific content */}
            {questionType === "mcq" && localBlockDoc.options && (
              <MCQEditor
                options={localBlockDoc.options}
                onOptionsChange={handleOptionsChange}
                paperId={block.paperId}
              />
            )}

            {questionType === "structured" && localBlockDoc.parts && (
              <StructuredEditor
                parts={localBlockDoc.parts}
                onPartsChange={handlePartsChange}
                paperId={block.paperId}
              />
            )}

            {questionType === "short_answer" && (
              <ShortAnswerEditor answerLines={localBlockDoc.answerLines} />
            )}

            {questionType === "essay" && (
              <EssayEditor answerSpace={localBlockDoc.answerSpace} />
            )}
          </div>
        )}

        {/* Collapsed preview */}
        {isCollapsed && (
          <div className="px-4 py-2 text-sm text-muted-foreground truncate">
            {stemText || "No question text"}
          </div>
        )}
      </div>
    </NodeViewWrapper>
  )
}

