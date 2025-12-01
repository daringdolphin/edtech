/*
<ai_context>
Extension registry for the worksheet editor.
Provides a centralized way to configure and build TipTap extensions.
Adding new extensions only requires updating this registry.
</ai_context>
*/

import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import Image from "@tiptap/extension-image"
import Dropcursor from "@tiptap/extension-dropcursor"
import Gapcursor from "@tiptap/extension-gapcursor"
import type { Extensions } from "@tiptap/react"

import { Spacer } from "./spacer"
import { Logo } from "./logo"
import { QuestionBlock, type QuestionBlockOptions } from "../features/question-block"

import type { SelectPaperBlock } from "@/db/schema"
import type { QuestionBlockDoc, QuestionBlockOverrides } from "@/types"

/**
 * Configuration options for building worksheet extensions.
 */
export interface WorksheetExtensionsConfig {
  /** Placeholder text for empty editor */
  placeholder?: string
  /** Question block configuration (optional - omit to disable question blocks) */
  questionBlock?: {
    getBlockById: (blockId: number) => SelectPaperBlock | undefined
    onBlockChange: (blockId: number, blockDoc: QuestionBlockDoc) => void
    onOverridesChange: (blockId: number, overrides: Partial<QuestionBlockOverrides>) => void
    onBlockDelete: (blockId: number) => void
    getDisplayNumber: (blockId: number) => string
  }
  /** Spacer configuration */
  spacer?: {
    defaultHeight?: number
    heights?: number[]
  }
  /** Image configuration */
  image?: {
    allowBase64?: boolean
  }
}

/**
 * Builds the TipTap extensions array for the worksheet editor.
 * Centralizes all extension configuration in one place.
 * 
 * @example
 * ```ts
 * const extensions = buildWorksheetExtensions({
 *   placeholder: "Start writing...",
 *   questionBlock: {
 *     getBlockById: (id) => blocksMap.get(id),
 *     onBlockChange: handleBlockChange,
 *     // ...
 *   }
 * })
 * ```
 */
export function buildWorksheetExtensions(
  config: WorksheetExtensionsConfig = {}
): Extensions {
  const {
    placeholder = "Start writing your worksheet...",
    questionBlock,
    spacer,
    image
  } = config

  const extensions: Extensions = [
    // Core editing functionality
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3]
      },
      horizontalRule: {
        HTMLAttributes: {
          class: "my-4 border-t border-border"
        }
      }
    }),

    // Placeholder for empty editor
    Placeholder.configure({
      placeholder,
      emptyEditorClass:
        "before:content-[attr(data-placeholder)] before:text-muted-foreground before:float-left before:h-0 before:pointer-events-none"
    }),

    // Image support
    Image.configure({
      HTMLAttributes: {
        class: "rounded-lg max-w-full h-auto my-4"
      },
      allowBase64: image?.allowBase64 ?? true
    }),

    // Cursor helpers
    Dropcursor.configure({
      color: "hsl(var(--primary))",
      width: 2
    }),
    Gapcursor,

    // Custom blocks
    Spacer.configure({
      defaultHeight: spacer?.defaultHeight ?? 32,
      heights: spacer?.heights ?? [16, 32, 48, 64, 96]
    }),
    Logo
  ]

  // Add question block support if configured
  if (questionBlock) {
    extensions.push(
      QuestionBlock.configure({
        getBlockById: questionBlock.getBlockById,
        onBlockChange: questionBlock.onBlockChange,
        onOverridesChange: questionBlock.onOverridesChange,
        onBlockDelete: questionBlock.onBlockDelete,
        getDisplayNumber: questionBlock.getDisplayNumber
      } as Partial<QuestionBlockOptions>)
    )
  }

  return extensions
}

/**
 * Get extension names for debugging/logging.
 */
export function getExtensionNames(extensions: Extensions): string[] {
  return extensions.map(ext => {
    // TipTap extensions are objects with a name property
    if (ext && typeof ext === "object" && "name" in ext) {
      return (ext as { name?: string }).name || "unknown"
    }
    return "unknown"
  })
}

