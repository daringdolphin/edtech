/*
<ai_context>
Header component for question blocks.
Contains drag handle, question number, type badge, marks, and action buttons.
</ai_context>
*/

"use client"

import {
  GripVertical,
  Settings,
  Trash2,
  ChevronDown,
  ChevronUp
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"

import type { QuestionType } from "@/types"

interface BlockHeaderProps {
  displayNumber: string
  questionType: QuestionType
  marks: number
  isCollapsed: boolean
  onToggleCollapse: () => void
  onMarksChange: (marks: number) => void
  onDelete: () => void
}

export function BlockHeader({
  displayNumber,
  questionType,
  marks,
  isCollapsed,
  onToggleCollapse,
  onMarksChange,
  onDelete
}: BlockHeaderProps) {
  return (
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
          [{marks} marks]
        </span>
      </div>

      {/* Collapse Toggle */}
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0"
        onClick={onToggleCollapse}
      >
        {isCollapsed ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronUp className="h-3 w-3" />
        )}
      </Button>

      {/* Settings Popover */}
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
                value={marks}
                onChange={e => onMarksChange(parseInt(e.target.value) || 1)}
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
        onClick={onDelete}
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  )
}

