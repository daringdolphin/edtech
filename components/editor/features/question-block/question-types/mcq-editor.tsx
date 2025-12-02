/*
<ai_context>
MCQ (Multiple Choice Question) editor component.
Renders options with labels (A, B, C, D...) and allows adding/removing options.
</ai_context>
*/

"use client"

import { useCallback } from "react"
import { Plus, X } from "lucide-react"

import { Button } from "@/components/ui/button"
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
    <div className="flex items-start gap-2 group">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border bg-muted text-xs font-medium">
        {option.label}
      </div>
      <div className="flex-1">
        <RichTextArea
          value={option.content}
          onChange={handleContentChange}
          placeholder={`Option ${option.label}...`}
          className="text-sm"
          paperId={paperId}
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

interface MCQEditorProps {
  options: MCQOption[]
  onOptionsChange: (options: MCQOption[]) => void
  paperId?: number
}

export function MCQEditor({ options, onOptionsChange, paperId }: MCQEditorProps) {
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
    <div className="space-y-2 pl-4">
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
  )
}

