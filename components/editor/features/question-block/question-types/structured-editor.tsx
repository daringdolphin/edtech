/*
<ai_context>
Structured question editor component.
Renders sub-parts (a, b, c...) with individual marks and answer lines.
Styled to feel native like document sub-items - no borders or heavy styling.
</ai_context>
*/

"use client"

import { useCallback } from "react"
import { Plus, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { RichTextArea } from "../ui/rich-text-area"
import { createSimpleDoc } from "@/lib/editor"

import type { QuestionBlockPart } from "@/types"

interface PartEditorProps {
  part: QuestionBlockPart
  onUpdate: (updated: QuestionBlockPart) => void
  onDelete: () => void
  canDelete: boolean
  paperId?: number
}

function PartEditor({
  part,
  onUpdate,
  onDelete,
  canDelete,
  paperId
}: PartEditorProps) {
  const handleContentChange = useCallback(
    (doc: QuestionBlockPart["content"]) => {
      onUpdate({
        ...part,
        content: doc
      })
    },
    [part, onUpdate]
  )

  const handleMarksChange = useCallback(
    (value: string) => {
      const marks = parseInt(value) || 1
      onUpdate({ ...part, marks })
    },
    [part, onUpdate]
  )

  return (
    <div className="group/part flex items-start gap-2">
      <span className="shrink-0 select-none text-muted-foreground">
        ({part.label})
      </span>
      <div className="flex-1 min-w-0">
        <RichTextArea
          value={part.content}
          onChange={handleContentChange}
          placeholder={`Part ${part.label}...`}
          paperId={paperId}
        />
      </div>
      {/* Marks indicator - inline with part */}
      <span className="shrink-0 text-xs text-muted-foreground self-start pt-1">
        [
        <input
          type="number"
          min={0}
          value={part.marks || 1}
          onChange={e => handleMarksChange(e.target.value)}
          className="w-6 bg-transparent text-center focus:outline-none"
        />
        ]
      </span>
      {canDelete && (
        <button
          className={cn(
            "shrink-0 p-1 rounded text-muted-foreground hover:text-destructive",
            "opacity-0 group-hover/part:opacity-100 transition-opacity"
          )}
          onClick={onDelete}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}

interface StructuredEditorProps {
  parts: QuestionBlockPart[]
  onPartsChange: (parts: QuestionBlockPart[]) => void
  paperId?: number
}

export function StructuredEditor({
  parts,
  onPartsChange,
  paperId
}: StructuredEditorProps) {
  const handlePartUpdate = useCallback(
    (index: number, updated: QuestionBlockPart) => {
      const newParts = [...parts]
      newParts[index] = updated
      onPartsChange(newParts)
    },
    [parts, onPartsChange]
  )

  const handlePartDelete = useCallback(
    (index: number) => {
      if (parts.length <= 1) return

      const newParts = parts.filter((_, i) => i !== index)
      // Re-label parts
      const relabeled = newParts.map((part, i) => ({
        ...part,
        label: String.fromCharCode(97 + i) // a, b, c...
      }))
      onPartsChange(relabeled)
    },
    [parts, onPartsChange]
  )

  const handleAddPart = useCallback(() => {
    const nextLabel = String.fromCharCode(97 + parts.length)
    const newPart: QuestionBlockPart = {
      id: crypto.randomUUID(),
      label: nextLabel,
      content: createSimpleDoc(""),
      marks: 1,
      answerLines: 2
    }
    onPartsChange([...parts, newPart])
  }, [parts, onPartsChange])

  return (
    <div className="space-y-1 ml-5">
      {parts.map((part, index) => (
        <PartEditor
          key={part.id}
          part={part}
          onUpdate={updated => handlePartUpdate(index, updated)}
          onDelete={() => handlePartDelete(index)}
          canDelete={parts.length > 1}
          paperId={paperId}
        />
      ))}
      <button
        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 py-1"
        onClick={handleAddPart}
      >
        <Plus className="h-3 w-3" />
        Add part
      </button>
    </div>
  )
}

