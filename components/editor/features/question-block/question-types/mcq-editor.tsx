/*
<ai_context>
MCQ (Multiple Choice Question) editor component.
Renders options with labels (A, B, C, D...) and allows adding/removing options.
Styled to feel native like a document list - no badges or heavy styling.
</ai_context>
*/

"use client"

import { useCallback } from "react"
import { Plus, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { RichTextArea } from "../ui/rich-text-area"
import { createSimpleDoc } from "@/lib/editor"

import type { MCQOption } from "@/types"

interface MCQOptionEditorProps {
  option: MCQOption
  onUpdate: (updated: MCQOption) => void
  onDelete: () => void
  canDelete: boolean
  paperId?: number
}

function MCQOptionEditor({
  option,
  onUpdate,
  onDelete,
  canDelete,
  paperId
}: MCQOptionEditorProps) {
  const handleContentChange = useCallback(
    (doc: MCQOption["content"]) => {
      onUpdate({
        ...option,
        content: doc
      })
    },
    [option, onUpdate]
  )

  return (
    <div className="group/option flex items-start gap-2">
      <span className="shrink-0 select-none text-muted-foreground">
        {option.label}.
      </span>
      <div className="flex-1 min-w-0">
        <RichTextArea
          value={option.content}
          onChange={handleContentChange}
          placeholder={`Option ${option.label}...`}
          paperId={paperId}
        />
      </div>
      {canDelete && (
        <button
          className={cn(
            "shrink-0 p-1 rounded text-muted-foreground hover:text-destructive",
            "opacity-0 group-hover/option:opacity-100 transition-opacity"
          )}
          onClick={onDelete}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}

interface MCQEditorProps {
  options: MCQOption[]
  onOptionsChange: (options: MCQOption[]) => void
  paperId?: number
}

export function MCQEditor({
  options,
  onOptionsChange,
  paperId
}: MCQEditorProps) {
  const handleOptionUpdate = useCallback(
    (index: number, updated: MCQOption) => {
      const newOptions = [...options]
      newOptions[index] = updated
      onOptionsChange(newOptions)
    },
    [options, onOptionsChange]
  )

  const handleOptionDelete = useCallback(
    (index: number) => {
      if (options.length <= 2) return

      const newOptions = options.filter((_, i) => i !== index)
      // Re-label options
      const relabeled = newOptions.map((opt, i) => ({
        ...opt,
        label: String.fromCharCode(65 + i) // A, B, C, D...
      }))
      onOptionsChange(relabeled)
    },
    [options, onOptionsChange]
  )

  const handleAddOption = useCallback(() => {
    const nextLabel = String.fromCharCode(65 + options.length)
    const newOption: MCQOption = {
      id: crypto.randomUUID(),
      label: nextLabel,
      content: createSimpleDoc("")
    }
    onOptionsChange([...options, newOption])
  }, [options, onOptionsChange])

  return (
    <div className="space-y-1 ml-5">
      {options.map((option, index) => (
        <MCQOptionEditor
          key={option.id}
          option={option}
          onUpdate={updated => handleOptionUpdate(index, updated)}
          onDelete={() => handleOptionDelete(index)}
          canDelete={options.length > 2}
          paperId={paperId}
        />
      ))}
      <button
        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 py-1"
        onClick={handleAddOption}
      >
        <Plus className="h-3 w-3" />
        Add option
      </button>
    </div>
  )
}

