/*
<ai_context>
Short answer question editor component.
Renders an answer space with configurable number of lines.
</ai_context>
*/

"use client"

import { AnswerSpace } from "../ui/answer-space"

interface ShortAnswerEditorProps {
  answerLines?: number
}

export function ShortAnswerEditor({ answerLines }: ShortAnswerEditorProps) {
  return (
    <div className="pl-4">
      <AnswerSpace lines={answerLines} />
    </div>
  )
}

