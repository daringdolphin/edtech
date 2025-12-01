/*
<ai_context>
Structured question editor component.
Renders sub-parts (a, b, c...) with individual marks and answer lines.
</ai_context>
*/

"use client"

import { useCallback, useMemo } from "react"
import { Plus, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RichTextArea } from "../ui/rich-text-area"
import { createSimpleDoc, extractPlainText } from "@/lib/editor"

import type { QuestionBlockPart } from "@/types"

interface PartEditorProps {
  part: QuestionBlockPart
  onUpdate: (updated: QuestionBlockPart) => void
  onDelete: () => void
  canDelete: boolean
}

function PartEditor({ part, onUpdate, onDelete, canDelete }: PartEditorProps) {
  const handleContentChange = useCallback(
    (text: string) => {
      onUpdate({
        ...part,
        content: createSimpleDoc(text)
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

  const plainText = useMemo(() => extractPlainText(part.content), [part.content])

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

interface StructuredEditorProps {
  parts: QuestionBlockPart[]
  onPartsChange: (parts: QuestionBlockPart[]) => void
}

export function StructuredEditor({ parts, onPartsChange }: StructuredEditorProps) {
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
    <div className="space-y-2 pl-4">
      {parts.map((part, index) => (
        <PartEditor
          key={part.id}
          part={part}
          onUpdate={updated => handlePartUpdate(index, updated)}
          onDelete={() => handlePartDelete(index)}
          canDelete={parts.length > 1}
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
  )
}

