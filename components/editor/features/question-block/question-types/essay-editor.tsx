/*
<ai_context>
Essay question editor component.
Renders a large answer space with configurable size.
</ai_context>
*/

"use client"

import { AnswerSpace } from "../ui/answer-space"

interface EssayEditorProps {
  answerSpace?: "small" | "medium" | "large"
}

export function EssayEditor({ answerSpace }: EssayEditorProps) {
  return (
    <div className="pl-4">
      <AnswerSpace size={answerSpace} />
    </div>
  )
}

