/*
<ai_context>
React NodeView component for rendering QuestionBlock nodes in TipTap.
Composes UI components and question type editors for rich editing experience.
Handles inline editing while maintaining the snapshot model.
Designed to feel native like Notion/Word - seamless, no visible boundaries.
</ai_context>
*/

"use client"

import { NodeViewWrapper, NodeViewProps } from "@tiptap/react"
import { useCallback, useState, useEffect, useMemo } from "react"
import { Settings, Trash2, GripVertical } from "lucide-react"

import { cn } from "@/lib/utils"
import { normalizeNumericId, extractPlainText } from "@/lib/editor"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"

import { RichTextArea } from "../ui"
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
  const {
    getBlockById,
    onBlockChange,
    onOverridesChange,
    onBlockDelete,
    getDisplayNumber
  } = options

  // Get block data (safe to call even if blockId is null)
  const block = blockId !== null ? getBlockById?.(blockId) : undefined
  const blockDoc = block?.blockDoc as QuestionBlockDoc | undefined
  const overrides = block?.overrides as QuestionBlockOverrides | undefined

  // Local state for editing - ALL HOOKS MUST BE CALLED BEFORE ANY EARLY RETURNS
  const [localBlockDoc, setLocalBlockDoc] = useState<QuestionBlockDoc | null>(
    blockDoc || null
  )
  const [isEditingDisplayNumber, setIsEditingDisplayNumber] = useState(false)
  const [displayNumberInput, setDisplayNumberInput] = useState("")

  // Sync with external block data
  useEffect(() => {
    if (blockDoc) {
      setLocalBlockDoc(blockDoc)
    }
  }, [blockDoc])

  // Get display number
  const displayNumber = useMemo(() => {
    if (blockId === null) return "1"
    if (overrides?.displayNumber) return overrides.displayNumber
    return getDisplayNumber?.(blockId) || "1"
  }, [overrides?.displayNumber, getDisplayNumber, blockId])

  // Initialize display number input when entering edit mode
  useEffect(() => {
    if (isEditingDisplayNumber) {
      setDisplayNumberInput(displayNumber)
    }
  }, [isEditingDisplayNumber, displayNumber])

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

  // Handle display number edit
  const handleDisplayNumberDoubleClick = useCallback(() => {
    if (blockId === null) return
    setIsEditingDisplayNumber(true)
  }, [blockId])

  const handleDisplayNumberSave = useCallback(() => {
    if (blockId === null) return
    
    const trimmed = displayNumberInput.trim()
    // If empty, set to null to clear the override (will be handled as removal)
    // Otherwise use the trimmed value
    const newOverride: string | null = trimmed === "" ? null : trimmed
    
    onOverridesChange?.(blockId, { 
      displayNumber: newOverride as string | undefined 
    })
    setIsEditingDisplayNumber(false)
  }, [blockId, displayNumberInput, onOverridesChange])

  const handleDisplayNumberCancel = useCallback(() => {
    setIsEditingDisplayNumber(false)
    setDisplayNumberInput(displayNumber)
  }, [displayNumber])

  const handleDisplayNumberKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault()
        handleDisplayNumberSave()
      } else if (e.key === "Escape") {
        e.preventDefault()
        handleDisplayNumberCancel()
      }
    },
    [handleDisplayNumberSave, handleDisplayNumberCancel]
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

  const marks = overrides?.maxMarks ?? 1

  // Early returns AFTER all hooks are called
  if (blockId === null) {
    return (
      <NodeViewWrapper className="question-block">
        <div className="py-2 text-muted-foreground">
          <span className="text-sm italic">
            Question block reference is missing.{" "}
            <button
              className="text-destructive hover:underline"
              onClick={deleteNode}
            >
              Remove
            </button>
          </span>
        </div>
      </NodeViewWrapper>
    )
  }

  // Loading state
  if (!block || !localBlockDoc) {
    return (
      <NodeViewWrapper className="question-block">
        <div className="py-2 text-muted-foreground">
          <span className="text-sm italic">Loading...</span>
        </div>
      </NodeViewWrapper>
    )
  }

  const questionType = localBlockDoc.questionType

  return (
    <NodeViewWrapper className="question-block my-6">
      <div
        className={cn(
          "group/question relative py-4",
          selected && "bg-primary/5 -mx-2 px-2 rounded"
        )}
      >
        {/* Hover controls - positioned absolutely on the left */}
        <div
          className={cn(
            "absolute -left-8 top-1 flex flex-col items-center gap-0.5",
            "opacity-0 group-hover/question:opacity-100 transition-opacity"
          )}
        >
          <div
            className="cursor-grab p-1 rounded hover:bg-muted text-muted-foreground"
            data-drag-handle
          >
            <GripVertical className="h-3.5 w-3.5" />
          </div>
        </div>

        {/* Hover controls - positioned absolutely on the right */}
        <div
          className={cn(
            "absolute -right-2 top-1 flex items-center gap-0.5",
            "opacity-0 group-hover/question:opacity-100 transition-opacity"
          )}
        >
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              >
                <Settings className="h-3.5 w-3.5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48" align="end">
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">Marks</Label>
                  <Input
                    type="number"
                    min={0}
                    value={marks}
                    onChange={e =>
                      handleMarksChange(parseInt(e.target.value) || 1)
                    }
                    className="h-7 text-sm"
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
            onClick={handleDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Question content - flows naturally like document text */}
        <div className="space-y-2">
          {/* Question number + stem on same line */}
          <div className="flex gap-2">
            {isEditingDisplayNumber ? (
              <Input
                value={displayNumberInput}
                onChange={e => setDisplayNumberInput(e.target.value)}
                onBlur={handleDisplayNumberSave}
                onKeyDown={handleDisplayNumberKeyDown}
                className="h-auto w-16 px-1 py-0 text-sm font-medium shrink-0"
                autoFocus
                onClick={e => e.stopPropagation()}
              />
            ) : (
              <span
                className="font-medium shrink-0 cursor-pointer hover:text-primary transition-colors"
                onDoubleClick={handleDisplayNumberDoubleClick}
                title="Double-click to edit"
              >
                {displayNumber}.
              </span>
            )}
            <div className="flex-1 min-w-0">
              <RichTextArea
                value={localBlockDoc.stem}
                onChange={handleStemChange}
                placeholder="Enter question text..."
                paperId={block.paperId}
              />
            </div>
            {/* Marks indicator - subtle, at the end */}
            <span className="text-xs text-muted-foreground shrink-0 self-start pt-1">
              [{marks}]
            </span>
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
      </div>
    </NodeViewWrapper>
  )
}

