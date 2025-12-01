/*
<ai_context>
React NodeView component for rendering QuestionBlock nodes in TipTap.
Provides rich editing UI for different question types (MCQ, short answer, structured, essay).
Handles inline editing while maintaining the snapshot model.
</ai_context>
*/

"use client"

import { NodeViewWrapper, NodeViewProps } from "@tiptap/react"
import { useCallback, useState, useEffect, useMemo } from "react"
import {
  GripVertical,
  Settings,
  Trash2,
  Plus,
  X,
  ChevronDown,
  ChevronUp
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

import type { SelectPaperBlock } from "@/db/schema"
import type {
  QuestionBlockDoc,
  QuestionBlockOverrides,
  QuestionType,
  MCQOption,
  QuestionBlockPart
} from "@/types"

function normalizeNumericId(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }

  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10)
    return Number.isFinite(parsed) ? parsed : null
  }

  if (typeof value === "bigint") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

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

/**
 * Simple rich text editor using contentEditable
 * For full rich text, we use a contentEditable div that syncs with the blockDoc
 */
function RichTextArea({
  value,
  onChange,
  placeholder,
  className
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}) {
  return (
    <div
      contentEditable
      suppressContentEditableWarning
      className={cn(
        "min-h-[1.5em] outline-none focus:ring-1 focus:ring-primary/20 rounded px-1 -mx-1",
        "empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/50",
        className
      )}
      data-placeholder={placeholder}
      onBlur={e => onChange(e.currentTarget.textContent || "")}
      dangerouslySetInnerHTML={{ __html: value }}
    />
  )
}

/**
 * MCQ Option editor component
 */
function MCQOptionEditor({
  option,
  onUpdate,
  onDelete,
  canDelete
}: {
  option: MCQOption
  onUpdate: (updated: MCQOption) => void
  onDelete: () => void
  canDelete: boolean
}) {
  const handleContentChange = useCallback(
    (text: string) => {
      onUpdate({
        ...option,
        content: { type: "doc", content: [{ type: "paragraph", content: text ? [{ type: "text", text }] : [] }] }
      })
    },
    [option, onUpdate]
  )

  // Extract plain text from JSONContent for display
  const plainText = useMemo(() => {
    const content = option.content?.content?.[0]?.content
    if (Array.isArray(content) && content[0]?.text) {
      return content[0].text
    }
    return ""
  }, [option.content])

  return (
    <div className="flex items-start gap-2 group">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border bg-muted text-xs font-medium">
        {option.label}
      </div>
      <div className="flex-1">
        <RichTextArea
          value={plainText}
          onChange={handleContentChange}
          placeholder={`Option ${option.label}...`}
          className="text-sm"
        />
      </div>
      {canDelete && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={onDelete}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}

/**
 * Structured question part editor
 */
function PartEditor({
  part,
  onUpdate,
  onDelete,
  canDelete
}: {
  part: QuestionBlockPart
  onUpdate: (updated: QuestionBlockPart) => void
  onDelete: () => void
  canDelete: boolean
}) {
  const handleContentChange = useCallback(
    (text: string) => {
      onUpdate({
        ...part,
        content: { type: "doc", content: [{ type: "paragraph", content: text ? [{ type: "text", text }] : [] }] }
      })
    },
    [part, onUpdate]
  )

  const handleMarksChange = useCallback(
    (marks: number) => {
      onUpdate({ ...part, marks })
    },
    [part, onUpdate]
  )

  // Extract plain text
  const plainText = useMemo(() => {
    const content = part.content?.content?.[0]?.content
    if (Array.isArray(content) && content[0]?.text) {
      return content[0].text
    }
    return ""
  }, [part.content])

  return (
    <div className="flex items-start gap-2 group border-l-2 border-muted pl-3 py-1">
      <div className="flex h-5 w-5 shrink-0 items-center justify-center text-xs font-medium text-muted-foreground">
        ({part.label})
      </div>
      <div className="flex-1 space-y-1">
        <RichTextArea
          value={plainText}
          onChange={handleContentChange}
          placeholder={`Part ${part.label}...`}
          className="text-sm"
        />
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Input
            type="number"
            min={0}
            value={part.marks || 1}
            onChange={e => handleMarksChange(parseInt(e.target.value) || 1)}
            className="h-5 w-12 text-xs px-1"
          />
          <span>marks</span>
        </div>
      </div>
      {canDelete && (
        <Button
          variant="ghost"
          size="sm"
          className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={onDelete}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}

/**
 * Answer space indicator for students
 */
function AnswerSpace({
  lines,
  size
}: {
  lines?: number
  size?: "small" | "medium" | "large"
}) {
  const height = useMemo(() => {
    if (lines) return lines * 24
    switch (size) {
      case "small":
        return 48
      case "medium":
        return 96
      case "large":
        return 192
      default:
        return 72
    }
  }, [lines, size])

  return (
    <div
      className="border border-dashed border-muted-foreground/30 rounded bg-muted/20 flex items-center justify-center text-xs text-muted-foreground"
      style={{ height }}
    >
      Answer space
    </div>
  )
}

/**
 * Main QuestionBlock NodeView component
 */
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
  const stemText = useMemo(() => {
    const stem = localBlockDoc?.stem
    const content = stem?.content?.[0]?.content
    if (Array.isArray(content) && content[0]?.text) {
      return content[0].text
    }
    return ""
  }, [localBlockDoc?.stem])

  // Handle stem change
  const handleStemChange = useCallback(
    (text: string) => {
      if (!localBlockDoc || blockId === null) return

      const updated: QuestionBlockDoc = {
        ...localBlockDoc,
        stem: {
          type: "doc",
          content: [{ type: "paragraph", content: text ? [{ type: "text", text }] : [] }]
        }
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

  // Handle MCQ option updates
  const handleOptionUpdate = useCallback(
    (index: number, updated: MCQOption) => {
      if (!localBlockDoc?.options || blockId === null) return

      const newOptions = [...localBlockDoc.options]
      newOptions[index] = updated

      const newDoc: QuestionBlockDoc = {
        ...localBlockDoc,
        options: newOptions
      }
      setLocalBlockDoc(newDoc)
      onBlockChange?.(blockId, newDoc)
    },
    [localBlockDoc, blockId, onBlockChange]
  )

  const handleOptionDelete = useCallback(
    (index: number) => {
      if (!localBlockDoc?.options || localBlockDoc.options.length <= 2 || blockId === null) return

      const newOptions = localBlockDoc.options.filter((_, i) => i !== index)
      // Re-label options
      const relabeled = newOptions.map((opt, i) => ({
        ...opt,
        label: String.fromCharCode(65 + i) // A, B, C, D...
      }))

      const newDoc: QuestionBlockDoc = {
        ...localBlockDoc,
        options: relabeled
      }
      setLocalBlockDoc(newDoc)
      onBlockChange?.(blockId, newDoc)
    },
    [localBlockDoc, blockId, onBlockChange]
  )

  const handleAddOption = useCallback(() => {
    if (!localBlockDoc?.options || blockId === null) return

    const nextLabel = String.fromCharCode(65 + localBlockDoc.options.length)
    const newOption: MCQOption = {
      id: crypto.randomUUID(),
      label: nextLabel,
      content: { type: "doc", content: [{ type: "paragraph", content: [] }] }
    }

    const newDoc: QuestionBlockDoc = {
      ...localBlockDoc,
      options: [...localBlockDoc.options, newOption]
    }
    setLocalBlockDoc(newDoc)
    onBlockChange?.(blockId, newDoc)
  }, [localBlockDoc, blockId, onBlockChange])

  // Handle part updates
  const handlePartUpdate = useCallback(
    (index: number, updated: QuestionBlockPart) => {
      if (!localBlockDoc?.parts || blockId === null) return

      const newParts = [...localBlockDoc.parts]
      newParts[index] = updated

      const newDoc: QuestionBlockDoc = {
        ...localBlockDoc,
        parts: newParts
      }
      setLocalBlockDoc(newDoc)
      onBlockChange?.(blockId, newDoc)
    },
    [localBlockDoc, blockId, onBlockChange]
  )

  const handlePartDelete = useCallback(
    (index: number) => {
      if (!localBlockDoc?.parts || localBlockDoc.parts.length <= 1 || blockId === null) return

      const newParts = localBlockDoc.parts.filter((_, i) => i !== index)
      // Re-label parts
      const relabeled = newParts.map((part, i) => ({
        ...part,
        label: String.fromCharCode(97 + i) // a, b, c...
      }))

      const newDoc: QuestionBlockDoc = {
        ...localBlockDoc,
        parts: relabeled
      }
      setLocalBlockDoc(newDoc)
      onBlockChange?.(blockId, newDoc)
    },
    [localBlockDoc, blockId, onBlockChange]
  )

  const handleAddPart = useCallback(() => {
    if (!localBlockDoc || blockId === null) return

    const parts = localBlockDoc.parts || []
    const nextLabel = String.fromCharCode(97 + parts.length)
    const newPart: QuestionBlockPart = {
      id: crypto.randomUUID(),
      label: nextLabel,
      content: { type: "doc", content: [{ type: "paragraph", content: [] }] },
      marks: 1,
      answerLines: 2
    }

    const newDoc: QuestionBlockDoc = {
      ...localBlockDoc,
      parts: [...parts, newPart]
    }
    setLocalBlockDoc(newDoc)
    onBlockChange?.(blockId, newDoc)
  }, [localBlockDoc, blockId, onBlockChange])

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
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-destructive hover:text-destructive"
              onClick={deleteNode}
            >
              Remove block
            </Button>
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
        {/* Header with drag handle and controls */}
        <div className="flex items-center gap-2 border-b bg-muted/30 px-3 py-2">
          {/* Drag Handle */}
          <div
            className="cursor-grab opacity-50 hover:opacity-100 transition-opacity"
            data-drag-handle
          >
            <GripVertical className="h-4 w-4" />
          </div>

          {/* Question Number & Type Badge */}
          <div className="flex items-center gap-2 flex-1">
            <span className="font-semibold text-sm">{displayNumber}</span>
            <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary capitalize">
              {questionType.replace("_", " ")}
            </span>
            <span className="text-xs text-muted-foreground ml-auto">
              [{overrides?.maxMarks ?? 1} marks]
            </span>
          </div>

          {/* Collapse Toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronUp className="h-3 w-3" />
            )}
          </Button>

          {/* Settings Dropdown */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Settings className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48" align="end">
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">Marks</Label>
                  <Input
                    type="number"
                    min={0}
                    value={overrides?.maxMarks ?? 1}
                    onChange={e =>
                      handleMarksChange(parseInt(e.target.value) || 1)
                    }
                    className="h-7 text-sm"
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Delete Button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
            onClick={handleDelete}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>

        {/* Content Area */}
        {!isCollapsed && (
          <div className="p-4 space-y-4">
            {/* Question Stem */}
            <div className="space-y-1">
              <RichTextArea
                value={stemText}
                onChange={handleStemChange}
                placeholder="Enter question text..."
                className="text-base"
              />
            </div>

            {/* Type-specific content */}
            {questionType === "mcq" && localBlockDoc.options && (
              <div className="space-y-2 pl-4">
                {localBlockDoc.options.map((option, index) => (
                  <MCQOptionEditor
                    key={option.id}
                    option={option}
                    onUpdate={updated => handleOptionUpdate(index, updated)}
                    onDelete={() => handleOptionDelete(index)}
                    canDelete={localBlockDoc.options!.length > 2}
                  />
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={handleAddOption}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add option
                </Button>
              </div>
            )}

            {questionType === "structured" && (
              <div className="space-y-2 pl-4">
                {localBlockDoc.parts?.map((part, index) => (
                  <PartEditor
                    key={part.id}
                    part={part}
                    onUpdate={updated => handlePartUpdate(index, updated)}
                    onDelete={() => handlePartDelete(index)}
                    canDelete={(localBlockDoc.parts?.length ?? 0) > 1}
                  />
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={handleAddPart}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add part
                </Button>
              </div>
            )}

            {questionType === "short_answer" && (
              <div className="pl-4">
                <AnswerSpace lines={localBlockDoc.answerLines} />
              </div>
            )}

            {questionType === "essay" && (
              <div className="pl-4">
                <AnswerSpace size={localBlockDoc.answerSpace} />
              </div>
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

export default QuestionBlockView

