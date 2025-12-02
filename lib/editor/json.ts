/*
<ai_context>
Shared JSON utilities for TipTap editor documents.
Provides normalization helpers to ensure attrs persist through server actions.
</ai_context>
*/

type JSONNode = {
  type?: string
  attrs?: Record<string, any>
  content?: JSONNode[]
  [key: string]: any
}

const PENDING_IMAGE_PROTOCOL = "pending-upload://"
const PENDING_IMAGE_PLACEHOLDER_SVG =
  "<svg xmlns='http://www.w3.org/2000/svg' width='600' height='420' viewBox='0 0 600 420' fill='none'><rect width='600' height='420' rx='12' fill='#f3f4f6'/><path d='M160 285L240 205L320 285L400 205L480 285' stroke='#d1d5db' stroke-width='16' stroke-linecap='round' stroke-linejoin='round'/><circle cx='190' cy='160' r='40' fill='#e5e7eb'/></svg>"
const PENDING_IMAGE_PLACEHOLDER_SRC = `data:image/svg+xml;utf8,${encodeURIComponent(PENDING_IMAGE_PLACEHOLDER_SVG)}`

function deepTransform<T>(value: T, transformer: (node: JSONNode) => JSONNode): T {
  if (Array.isArray(value)) {
    return value.map(child => deepTransform(child, transformer)) as unknown as T
  }

  if (!value || typeof value !== "object") {
    return value
  }

  const clone: JSONNode = { ...(value as JSONNode) }

  if (clone.attrs && typeof clone.attrs === "object") {
    clone.attrs = { ...clone.attrs }
  }

  if (Array.isArray(clone.content)) {
    clone.content = clone.content.map(child => deepTransform(child, transformer))
  }

  if (typeof clone.type === "string") {
    return transformer(clone) as T
  }

  return clone as T
}

function sanitizeImageNodeForPersistence(node: JSONNode): JSONNode {
  if (node.type !== "image" || !node.attrs) {
    return node
  }

  const attrs = node.attrs
  const src = typeof attrs.src === "string" ? attrs.src : ""
  const persistedSrc =
    typeof attrs.dataUploadPersistedSrc === "string" ? attrs.dataUploadPersistedSrc : undefined

  if (src.startsWith("blob:")) {
    const uploadKey = typeof attrs.dataUploadKey === "string" ? attrs.dataUploadKey : undefined
    if (uploadKey) {
      const pendingValue = `${PENDING_IMAGE_PROTOCOL}${uploadKey}`
      attrs.dataUploadPersistedSrc = pendingValue
      attrs.src = pendingValue
      attrs.dataUploadStatus = "pending"
    } else {
      attrs.src = ""
      attrs.dataUploadPersistedSrc = ""
      attrs.dataUploadStatus = "error"
    }
    return node
  }

  if (persistedSrc) {
    attrs.src = persistedSrc
    return node
  }

  if (src) {
    attrs.dataUploadPersistedSrc = src
  }

  return node
}

function hydrateImageNodeForEditor(node: JSONNode): JSONNode {
  if (node.type !== "image" || !node.attrs) {
    return node
  }

  const attrs = node.attrs
  const persistedSrc =
    typeof attrs.dataUploadPersistedSrc === "string" ? attrs.dataUploadPersistedSrc : undefined

  if (!persistedSrc) {
    return node
  }

  if (persistedSrc.startsWith(PENDING_IMAGE_PROTOCOL)) {
    if (typeof attrs.dataUploadKey !== "string") {
      attrs.dataUploadKey = persistedSrc.replace(PENDING_IMAGE_PROTOCOL, "")
    }
    attrs.dataUploadStatus = attrs.dataUploadStatus ?? "pending"
    if (
      typeof attrs.src !== "string" ||
      attrs.src === "" ||
      attrs.src === persistedSrc ||
      attrs.src.startsWith("pending-upload://")
    ) {
      attrs.src = PENDING_IMAGE_PLACEHOLDER_SRC
    }
    return node
  }

  attrs.src = persistedSrc
  attrs.dataUploadStatus = "complete"
  return node
}

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
 * Ensures image nodes never persist blob URLs by swapping them for a stable
 * stored value (either a Supabase URL or a pending placeholder).
 */
export function prepareEditorDocForSave<T>(doc: T): T {
  return deepTransform(doc, sanitizeImageNodeForPersistence)
}

/**
 * Restores persisted image placeholders to an editor-friendly state so users
 * can continue editing even if uploads were previously pending.
 */
export function hydrateEditorDoc<T>(doc: T): T {
  return deepTransform(doc, hydrateImageNodeForEditor)
}

/**
 * Exposes the pending protocol to other modules (e.g. detecting placeholders).
 */
export const IMAGE_PENDING_PROTOCOL = PENDING_IMAGE_PROTOCOL

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

