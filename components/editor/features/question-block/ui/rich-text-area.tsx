/*
<ai_context>
TipTap-powered rich text area for question block inputs.
Supports inline formatting plus image pasting with Supabase uploads.
</ai_context>
*/

"use client"

import { useCallback, useEffect, useMemo, useRef } from "react"
import { EditorContent, useEditor } from "@tiptap/react"
import type { JSONContent, Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import { toast } from "sonner"
import type { EditorView } from "@tiptap/pm/view"

import { cn } from "@/lib/utils"
import {
  hydrateEditorDoc,
  normalizeEditorDoc,
  prepareEditorDocForSave,
  IMAGE_PENDING_PROTOCOL
} from "@/lib/editor"
import { uploadPaperScreenshot, validatePaperImageFile } from "@/lib/uploads"
import { UploadableImage } from "@/components/editor/extensions/uploadable-image"
import {
  updateImageAttrsByUploadKey,
  removeImageByUploadKey
} from "@/components/editor/core/editor-image-helpers"

interface RichTextAreaProps {
  value?: JSONContent | null
  onChange: (value: JSONContent) => void
  placeholder?: string
  className?: string
  paperId?: number
}

const DEFAULT_DOC: JSONContent = {
  type: "doc",
  content: [{ type: "paragraph" }]
}

interface ClipboardUploadOptions {
  editorInstance: Editor
  file: File
  paperIdValue: number
  placeholderSrc: string
  uploadKey: string
}

export function RichTextArea({
  value,
  onChange,
  placeholder,
  className,
  paperId
}: RichTextAreaProps) {
  const editorRef = useRef<Editor | null>(null)
  const paperIdRef = useRef<number | undefined>(paperId)

  useEffect(() => {
    paperIdRef.current = paperId
  }, [paperId])

  const uploadImageFromClipboard = useCallback(
    async ({
      editorInstance,
      file,
      paperIdValue,
      placeholderSrc,
      uploadKey
    }: ClipboardUploadOptions) => {
      if (!editorInstance || editorInstance.isDestroyed) {
        URL.revokeObjectURL(placeholderSrc)
        return
      }

      try {
        const { url } = await uploadPaperScreenshot({
          file,
          paperId: paperIdValue
        })

        if (editorInstance.isDestroyed) {
          return
        }

        const updated = updateImageAttrsByUploadKey(editorInstance, uploadKey, attrs => ({
          ...attrs,
          src: url,
          dataUploadStatus: "complete",
          dataUploadPersistedSrc: url
        }))
        if (!updated) {
          return
        }
      } catch (error) {
        if (!editorInstance || editorInstance.isDestroyed) {
          return
        }

        removeImageByUploadKey(editorInstance, uploadKey)
        const message =
          error instanceof Error ? error.message : "Failed to upload image."
        toast.error(message)
      } finally {
        URL.revokeObjectURL(placeholderSrc)
      }
    },
    []
  )

  const handleImagePaste = useCallback(
    (_view: EditorView, event: ClipboardEvent) => {
      const editorInstance = editorRef.current
      const paperIdValue = paperIdRef.current

      if (!editorInstance) {
        return false
      }

      const clipboardItems = Array.from(event.clipboardData?.items ?? [])
      const imageItem = clipboardItems.find(
        item => item.kind === "file" && item.type.startsWith("image/")
      )

      if (!imageItem) {
        return false
      }

      const file = imageItem.getAsFile()
      if (!file) {
        return false
      }

      if (!paperIdValue) {
        toast.error("Paper ID is missing, cannot upload image.")
        return true
      }

      event.preventDefault()

      const validationError = validatePaperImageFile(file)
      if (validationError) {
        toast.error(validationError)
        return true
      }

      const placeholderSrc = URL.createObjectURL(file)
      const uploadKey = crypto.randomUUID()
      const persistedSrc = `${IMAGE_PENDING_PROTOCOL}${uploadKey}`
      const inserted = editorInstance
        .chain()
        .focus()
        .setImage({
          src: placeholderSrc,
          alt: file.name || "Screenshot",
          dataUploadKey: uploadKey,
          dataUploadStatus: "pending",
          dataUploadPersistedSrc: persistedSrc
        })
        .run()

      if (!inserted) {
        URL.revokeObjectURL(placeholderSrc)
        toast.error("Could not insert image.")
        return true
      }

      void uploadImageFromClipboard({
        editorInstance,
        file,
        paperIdValue,
        placeholderSrc,
        uploadKey
      })

      return true
    },
    [uploadImageFromClipboard]
  )

  const hydratedInitialValue = useMemo(
    () => hydrateEditorDoc(value ?? DEFAULT_DOC),
    [value]
  )

  const editor = useEditor(
    {
      content: hydratedInitialValue,
      extensions: [
        StarterKit.configure({
          heading: false,
          horizontalRule: false
        }),
        Placeholder.configure({
          placeholder: placeholder ?? "",
          emptyEditorClass:
            "before:content-[attr(data-placeholder)] before:text-muted-foreground/50 before:pointer-events-none"
        }),
        UploadableImage.configure({
          HTMLAttributes: {
            class: "rounded-lg max-w-full h-auto my-2"
          }
        })
      ],
      editorProps: {
        attributes: {
          class: cn(
            "min-h-[1.75rem] outline-none focus-visible:ring-1 focus-visible:ring-primary/20 rounded px-1 -mx-1 text-sm",
            className
          )
        },
        handlePaste: handleImagePaste
      },
      onUpdate: ({ editor }) => {
        const doc = editor.getJSON()
        const normalized = normalizeEditorDoc(doc)
        const prepared = prepareEditorDocForSave(normalized)
        onChange(prepared)
      },
      immediatelyRender: false
    },
    [className, handleImagePaste, onChange, placeholder, hydratedInitialValue]
  )

  useEffect(() => {
    editorRef.current = editor
  }, [editor])

  useEffect(() => {
    if (!editor || !value) {
      return
    }

    const current = JSON.stringify(editor.getJSON())
    const hydratedValue = hydrateEditorDoc(value)
    const next = JSON.stringify(hydratedValue)
    if (current !== next) {
      editor.commands.setContent(hydratedValue)
    }
  }, [editor, value])

  return <EditorContent editor={editor} />
}

