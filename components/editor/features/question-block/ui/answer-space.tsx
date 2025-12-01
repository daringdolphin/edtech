/*
<ai_context>
Answer space indicator component for students.
Shows a dashed box where students should write their answers.
</ai_context>
*/

"use client"

import { useMemo } from "react"

interface AnswerSpaceProps {
  lines?: number
  size?: "small" | "medium" | "large"
}

export function AnswerSpace({ lines, size }: AnswerSpaceProps) {
  const height = useMemo(() => {
    if (lines) return lines * 24
    switch (size) {
      case "small":
        return 48
      case "medium":
        return 96
      case "large":
        return 192
      default:
        return 72
    }
  }, [lines, size])

  return (
    <div
      className="border border-dashed border-muted-foreground/30 rounded bg-muted/20 flex items-center justify-center text-xs text-muted-foreground"
      style={{ height }}
    >
      Answer space
    </div>
  )
}

