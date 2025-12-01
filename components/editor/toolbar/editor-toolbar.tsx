/*
<ai_context>
Main toolbar component that composes all toolbar groups.
Consumes editor from context and renders appropriate controls.
</ai_context>
*/

"use client"

import { useCallback, useRef } from "react"
import type { Editor } from "@tiptap/react"

import { Separator } from "@/components/ui/separator"
import { useEditorContext } from "../core"

import { HistoryGroup } from "./history-group"
import { FormattingGroup } from "./formatting-group"
import { HeadingGroup } from "./heading-group"
import { ListGroup } from "./list-group"
import { BlocksGroup } from "./blocks-group"
import { MediaGroup } from "./media-group"
import { QuestionMenu } from "./question-menu"

import type { QuestionType } from "@/types"

interface EditorToolbarProps {
  /** Override editor instance (optional, defaults to context) */
  editor?: Editor | null
  /** Callback when adding a question (optional, defaults to context) */
  onAddQuestionBlock?: (questionType: QuestionType) => void
}

export function EditorToolbar({
  editor: editorProp,
  onAddQuestionBlock: onAddQuestionBlockProp
}: EditorToolbarProps = {}) {
  const context = useEditorContext()
  const editor = editorProp ?? context.editor
  const editorRef = useRef<Editor | null>(null)

  // Keep ref in sync
  if (editor) {
    editorRef.current = editor
  }

  // Determine if question blocks are enabled
  const questionBlockCallbacks = context.questionBlockCallbacks
  const hasQuestionSupport = !!onAddQuestionBlockProp || !!questionBlockCallbacks?.onAddQuestionBlock

  // Handle adding question block
  const handleAddQuestion = useCallback(
    async (questionType: QuestionType) => {
      // Use prop callback if provided
      if (onAddQuestionBlockProp) {
        onAddQuestionBlockProp(questionType)
        return
      }

      // Otherwise use context callback
      if (!questionBlockCallbacks?.onAddQuestionBlock) return

      const currentEditor = editorRef.current
      if (!currentEditor || currentEditor.isDestroyed) return

      try {
        const newBlock = await questionBlockCallbacks.onAddQuestionBlock(questionType)
        if (newBlock) {
          // Check if editor is still valid after async operation
          const editorAfterAsync = editorRef.current
          if (!editorAfterAsync || editorAfterAsync.isDestroyed) {
            console.warn("Editor is not available after async operation")
            return
          }

          // Insert the question block at the current cursor position
          editorAfterAsync
            .chain()
            .focus()
            .insertQuestionBlock({
              blockId: newBlock.id,
              questionItemId: newBlock.questionItemId
            })
            .run()
        }
      } catch (error) {
        console.error("Error adding question block:", error)
      }
    },
    [onAddQuestionBlockProp, questionBlockCallbacks]
  )

  if (!editor) {
    return null
  }

  return (
    <div className="flex flex-wrap items-center gap-0.5 rounded-lg border bg-background p-1">
      <HistoryGroup editor={editor} />

      <Separator orientation="vertical" className="mx-1 h-6" />

      <FormattingGroup editor={editor} />

      <Separator orientation="vertical" className="mx-1 h-6" />

      <HeadingGroup editor={editor} />

      <Separator orientation="vertical" className="mx-1 h-6" />

      <ListGroup editor={editor} />

      <Separator orientation="vertical" className="mx-1 h-6" />

      <BlocksGroup editor={editor} />
      <MediaGroup editor={editor} />

      {hasQuestionSupport && (
        <>
          <Separator orientation="vertical" className="mx-1 h-6" />
          <QuestionMenu onAddQuestion={handleAddQuestion} />
        </>
      )}
    </div>
  )
}

