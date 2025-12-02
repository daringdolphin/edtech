/*
<ai_context>
Shared types and module augmentation for TipTap image uploads.
Extends the base SetImageOptions to support upload metadata attrs.
</ai_context>
*/

export type ImageUploadStatus = "pending" | "complete" | "error"

declare module "@tiptap/extension-image" {
  interface SetImageOptions {
    dataUploadKey?: string | null
    dataUploadStatus?: ImageUploadStatus | null
    dataUploadPersistedSrc?: string | null
  }
}

