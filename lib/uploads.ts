/*
<ai_context>
Utilities for uploading paper assets (clipboard screenshots, inline images).
Provides client-side validation rules shared with server handlers.
</ai_context>
*/

export const PAPER_IMAGE_ALLOWED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif"
] as const

export const PAPER_IMAGE_ALLOWED_EXTENSIONS = [
  "png",
  "jpeg",
  "jpg",
  "gif",
  "webp",
  "heic",
  "heif"
] as const

export const PAPER_IMAGE_MAX_BYTES = 5 * 1024 * 1024 // 5MB

export interface UploadPaperScreenshotParams {
  file: File
  paperId: number
  signal?: AbortSignal
}

interface UploadPaperScreenshotPayload {
  url: string
  path?: string
}

interface UploadPaperScreenshotErrorPayload {
  message?: string
}

const PAPER_UPLOAD_ENDPOINT = "/api/uploads/papers"

export function validatePaperImageFile(file: File): string | null {
  if (file.size > PAPER_IMAGE_MAX_BYTES) {
    return "Images must be 5MB or smaller."
  }

  const mime = (file.type || "").toLowerCase()
  const extension = file.name.split(".").pop()?.toLowerCase()
  const mimeAllowed = PAPER_IMAGE_ALLOWED_MIME_TYPES.includes(mime as typeof PAPER_IMAGE_ALLOWED_MIME_TYPES[number])
  const extensionAllowed = extension
    ? PAPER_IMAGE_ALLOWED_EXTENSIONS.includes(extension as typeof PAPER_IMAGE_ALLOWED_EXTENSIONS[number])
    : false

  if (!mimeAllowed && !extensionAllowed) {
    return "Only PNG, JPG, GIF, WebP, or HEIC images are supported."
  }

  return null
}

export async function uploadPaperScreenshot({
  file,
  paperId,
  signal
}: UploadPaperScreenshotParams): Promise<UploadPaperScreenshotPayload> {
  if (!Number.isFinite(paperId)) {
    throw new Error("A valid paperId is required before uploading images.")
  }

  const validationError = validatePaperImageFile(file)
  if (validationError) {
    throw new Error(validationError)
  }

  const formData = new FormData()
  formData.append("file", file)
  formData.append("paperId", String(paperId))

  const response = await fetch(PAPER_UPLOAD_ENDPOINT, {
    method: "POST",
    body: formData,
    signal
  })

  let payload: UploadPaperScreenshotPayload | UploadPaperScreenshotErrorPayload | null = null
  try {
    payload = (await response.json()) as UploadPaperScreenshotPayload | UploadPaperScreenshotErrorPayload
  } catch {
    payload = null
  }

  if (!response.ok) {
    const message =
      (payload && typeof payload === "object" && "message" in payload && typeof payload.message === "string"
        ? payload.message
        : undefined) ||
      "Failed to upload image."
    throw new Error(typeof message === "string" ? message : "Failed to upload image.")
  }

  if (!payload || typeof payload !== "object" || !("url" in payload) || typeof payload.url !== "string") {
    throw new Error("Upload response was malformed.")
  }

  return payload as UploadPaperScreenshotPayload
}

