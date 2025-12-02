/*
<ai_context>
Extends the base TipTap Image node with upload-specific attributes.
Allows us to store pending upload metadata directly on image nodes.
</ai_context>
*/

import Image from "@tiptap/extension-image"
import type { ImageOptions } from "@tiptap/extension-image"

export const UploadableImage = Image.extend<ImageOptions>({
  addAttributes() {
    const parentAttributes =
      typeof this.parent === "function"
        ? (this.parent() as Record<string, any>)
        : {}

    return {
      ...parentAttributes,
      dataUploadKey: {
        default: null
      },
      dataUploadStatus: {
        default: null
      },
      dataUploadPersistedSrc: {
        default: null
      }
    }
  }
})

export type UploadableImageOptions = ImageOptions

