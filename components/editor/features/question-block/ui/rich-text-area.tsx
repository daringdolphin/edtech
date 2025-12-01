/*
<ai_context>
Simple rich text editor using contentEditable.
Used for inline editing of question stems and options.
</ai_context>
*/

"use client"

import { cn } from "@/lib/utils"

interface RichTextAreaProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function RichTextArea({
  value,
  onChange,
  placeholder,
  className
}: RichTextAreaProps) {
  return (
    <div
      contentEditable
      suppressContentEditableWarning
      className={cn(
        "min-h-[1.5em] outline-none focus:ring-1 focus:ring-primary/20 rounded px-1 -mx-1",
        "empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/50",
        className
      )}
      data-placeholder={placeholder}
      onBlur={e => onChange(e.currentTarget.textContent || "")}
      dangerouslySetInnerHTML={{ __html: value }}
    />
  )
}

