/*
<ai_context>
Answer space indicator component for students.
Shows lines where students should write their answers.
Styled minimally to feel native to the document - like ruled lines.
</ai_context>
*/

"use client"

import { useMemo } from "react"

interface AnswerSpaceProps {
  lines?: number
  size?: "small" | "medium" | "large"
}

export function AnswerSpace({ lines, size }: AnswerSpaceProps) {
  const lineCount = useMemo(() => {
    if (lines) return lines
    switch (size) {
      case "small":
        return 2
      case "medium":
        return 4
      case "large":
        return 8
      default:
        return 3
    }
  }, [lines, size])

  // Generate horizontal lines like ruled paper
  return (
    <div className="py-1">
      {Array.from({ length: lineCount }).map((_, i) => (
        <div
          key={i}
          className="h-6 border-b border-muted-foreground/20"
        />
      ))}
    </div>
  )
}

