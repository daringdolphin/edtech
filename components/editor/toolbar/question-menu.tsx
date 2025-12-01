/*
<ai_context>
Toolbar dropdown menu for adding question blocks.
Supports MCQ, short answer, structured, and essay question types.
</ai_context>
*/

"use client"

import {
  CirclePlus,
  ListChecks,
  AlignLeft,
  FileQuestion,
  FileText
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

import type { QuestionType } from "@/types"

interface QuestionMenuProps {
  onAddQuestion: (questionType: QuestionType) => void
}

export function QuestionMenu({ onAddQuestion }: QuestionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 gap-1 px-2">
          <CirclePlus className="h-4 w-4" />
          <span className="text-xs">Question</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => onAddQuestion("mcq")}>
          <ListChecks className="mr-2 h-4 w-4" />
          Multiple Choice
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAddQuestion("short_answer")}>
          <AlignLeft className="mr-2 h-4 w-4" />
          Short Answer
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAddQuestion("structured")}>
          <FileQuestion className="mr-2 h-4 w-4" />
          Structured
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAddQuestion("essay")}>
          <FileText className="mr-2 h-4 w-4" />
          Essay
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

