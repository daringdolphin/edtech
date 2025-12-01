/*
<ai_context>
Shared JSON utilities for TipTap editor documents.
Provides normalization helpers to ensure attrs persist through server actions.
</ai_context>
*/

/**
 * Normalizes a TipTap document by deep cloning through JSON serialization.
 * This ensures all attrs (like blockId) persist when saving to the database.
 * 
 * @see Memory: TipTap editor JSON must be normalized with JSON.parse(JSON.stringify(...))
 * before saving to ensure attrs persist through server actions.
 */
export function normalizeEditorDoc<T>(doc: T): T {
  return JSON.parse(JSON.stringify(doc))
}

/**
 * Safely parses a numeric ID from various input types.
 * Handles string, number, and bigint inputs.
 */
export function normalizeNumericId(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }

  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10)
    return Number.isFinite(parsed) ? parsed : null
  }

  if (typeof value === "bigint") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

/**
 * Extracts plain text from a JSONContent node.
 * Useful for displaying previews or collapsed states.
 */
export function extractPlainText(content: unknown): string {
  if (!content || typeof content !== "object") return ""
  
  const doc = content as { content?: Array<{ content?: Array<{ text?: string }> }> }
  const firstParagraph = doc.content?.[0]?.content
  
  if (Array.isArray(firstParagraph) && firstParagraph[0]?.text) {
    return firstParagraph[0].text
  }
  
  return ""
}

/**
 * Creates a simple JSONContent document with a single paragraph.
 */
export function createSimpleDoc(text: string = ""): Record<string, unknown> {
  return {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: text ? [{ type: "text", text }] : []
      }
    ]
  }
}

