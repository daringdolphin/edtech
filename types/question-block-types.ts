/*
<ai_context>
Types for Question Block primitives used in the paper editor.
Defines the blockDoc structure, overrides, and meta for paper_blocks.
</ai_context>
*/

import type { JSONContent } from "@tiptap/react"

/**
 * Question types supported by the system
 */
export type QuestionType = "mcq" | "short_answer" | "structured" | "essay"

/**
 * MCQ option structure
 */
export interface MCQOption {
  id: string
  label: string // "A", "B", "C", "D"
  content: JSONContent // Rich text content for the option
  isCorrect?: boolean // For answer key (not shown to students)
}

/**
 * Question block document structure
 * This is stored in paper_blocks.blockDoc
 */
export interface QuestionBlockDoc {
  type: "questionBlock"
  questionType: QuestionType
  stem: JSONContent // The main question text/prompt
  parts?: QuestionBlockPart[] // For structured questions with sub-parts
  options?: MCQOption[] // For MCQ questions
  answerLines?: number // For short answer - number of lines to show
  answerSpace?: "small" | "medium" | "large" // For essay questions
}

/**
 * A sub-part of a structured question (e.g., Q1a, Q1b)
 */
export interface QuestionBlockPart {
  id: string
  label: string // "a", "b", "c", "i", "ii"
  content: JSONContent // Rich text content for the part
  marks?: number // Marks for this specific part
  answerLines?: number // Number of answer lines for this part
}

/**
 * Overrides for a question block on a specific paper
 * These override the defaults from the source question_item
 */
export interface QuestionBlockOverrides {
  maxMarks?: number // Override the marks for this question
  displayNumber?: string // Override the display number (usually auto-computed)
  hiddenParts?: string[] // IDs of parts to hide on this paper
  showAnswerKey?: boolean // Whether to show correct answers (for answer key view)
}

/**
 * Runtime metadata for a question block
 */
export interface QuestionBlockMeta {
  collapsed?: boolean // Whether the block is collapsed in the editor
  focused?: boolean // Whether the block is currently focused
  lastEditedAt?: string // ISO timestamp of last edit
}

/**
 * Attributes stored on the TipTap questionBlock node
 */
export interface QuestionBlockAttrs {
  blockId: number // References paper_blocks.id
  questionItemId?: number | null // References question_items.id (for lineage)
}

/**
 * Helper to create a blank question block document
 */
export function createBlankQuestionBlockDoc(
  questionType: QuestionType
): QuestionBlockDoc {
  const baseStem: JSONContent = {
    type: "doc",
    content: [{ type: "paragraph", content: [] }]
  }

  switch (questionType) {
    case "mcq":
      return {
        type: "questionBlock",
        questionType: "mcq",
        stem: baseStem,
        options: [
          { id: crypto.randomUUID(), label: "A", content: baseStem },
          { id: crypto.randomUUID(), label: "B", content: baseStem },
          { id: crypto.randomUUID(), label: "C", content: baseStem },
          { id: crypto.randomUUID(), label: "D", content: baseStem }
        ]
      }

    case "short_answer":
      return {
        type: "questionBlock",
        questionType: "short_answer",
        stem: baseStem,
        answerLines: 3
      }

    case "structured":
      return {
        type: "questionBlock",
        questionType: "structured",
        stem: baseStem,
        parts: [
          {
            id: crypto.randomUUID(),
            label: "a",
            content: baseStem,
            marks: 1,
            answerLines: 2
          }
        ]
      }

    case "essay":
      return {
        type: "questionBlock",
        questionType: "essay",
        stem: baseStem,
        answerSpace: "large"
      }

    default:
      return {
        type: "questionBlock",
        questionType: "short_answer",
        stem: baseStem,
        answerLines: 3
      }
  }
}

/**
 * Default overrides for a new question block
 */
export function createDefaultOverrides(maxMarks: number = 1): QuestionBlockOverrides {
  return {
    maxMarks
  }
}

/**
 * Default meta for a new question block
 */
export function createDefaultMeta(): QuestionBlockMeta {
  return {
    collapsed: false
  }
}

