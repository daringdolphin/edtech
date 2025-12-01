/*
<ai_context>
TipTap extension for QuestionBlock nodes.
Defines the node structure and commands for inserting question blocks.
Uses a React NodeView for rich interactive rendering.
</ai_context>
*/

import { Node, mergeAttributes } from "@tiptap/core"
import { ReactNodeViewRenderer } from "@tiptap/react"
import { QuestionBlockView } from "./node-view"
import type { SelectPaperBlock } from "@/db/schema"
import type {
  QuestionBlockDoc,
  QuestionBlockOverrides
} from "@/types"

export interface QuestionBlockOptions {
  HTMLAttributes: Record<string, unknown>
  /**
   * Function to get block data by ID
   * Provided by the editor parent component
   */
  getBlockById?: (blockId: number) => SelectPaperBlock | undefined
  /**
   * Callback when block content changes
   */
  onBlockChange?: (
    blockId: number,
    blockDoc: QuestionBlockDoc
  ) => void
  /**
   * Callback when block overrides change
   */
  onOverridesChange?: (
    blockId: number,
    overrides: Partial<QuestionBlockOverrides>
  ) => void
  /**
   * Callback when block is deleted
   */
  onBlockDelete?: (blockId: number) => void
  /**
   * Callback to compute display number for a block
   */
  getDisplayNumber?: (blockId: number) => string
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    questionBlock: {
      /**
       * Insert a question block at the current position
       */
      insertQuestionBlock: (options: {
        blockId: number
        questionItemId?: number | null
      }) => ReturnType
      /**
       * Delete a question block by its block ID
       */
      deleteQuestionBlock: (blockId: number) => ReturnType
    }
  }
}

export const QuestionBlock = Node.create<QuestionBlockOptions>({
  name: "questionBlock",

  group: "block",

  // Atom nodes are treated as a single unit
  atom: true,

  // Enable drag and drop
  draggable: true,

  // Selectable as a whole
  selectable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
      getBlockById: undefined,
      onBlockChange: undefined,
      onOverridesChange: undefined,
      onBlockDelete: undefined,
      getDisplayNumber: undefined
    }
  },

  addAttributes() {
    return {
      blockId: {
        default: null,
        parseHTML: (element: HTMLElement) => {
          const id = element.getAttribute("data-block-id")
          return id ? parseInt(id, 10) : null
        },
        renderHTML: (attributes: { blockId: number | null }) => {
          if (!attributes.blockId) return {}
          return {
            "data-block-id": attributes.blockId
          }
        }
      },
      questionItemId: {
        default: null,
        parseHTML: (element: HTMLElement) => {
          const id = element.getAttribute("data-question-item-id")
          return id ? parseInt(id, 10) : null
        },
        renderHTML: (attributes: { questionItemId: number | null }) => {
          if (!attributes.questionItemId) return {}
          return {
            "data-question-item-id": attributes.questionItemId
          }
        }
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="question-block"]'
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "question-block",
        class: "question-block"
      }),
      // Fallback content for non-React rendering
      ["div", { class: "question-block-placeholder" }, "Question Block"]
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(QuestionBlockView)
  },

  addCommands() {
    return {
      insertQuestionBlock:
        (options: { blockId: number; questionItemId?: number | null }) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              blockId: options.blockId,
              questionItemId: options.questionItemId ?? null
            }
          })
        },

      deleteQuestionBlock:
        (blockId: number) =>
        ({ state, dispatch }) => {
          const { doc, tr } = state
          let deleted = false

          doc.descendants((node, pos) => {
            if (
              node.type.name === this.name &&
              node.attrs.blockId === blockId
            ) {
              if (dispatch) {
                tr.delete(pos, pos + node.nodeSize)
                deleted = true
              }
              return false // Stop iteration
            }
            return true
          })

          if (dispatch && deleted) {
            dispatch(tr)
          }

          return deleted
        }
    }
  },

  // Keyboard shortcuts
  addKeyboardShortcuts() {
    return {
      // Delete the block when backspace is pressed at the start
      Backspace: ({ editor }) => {
        const { selection } = editor.state
        const { $anchor } = selection
        const node = $anchor.node()

        // If we're in a question block and at the start, delete it
        if (
          node.type.name === this.name ||
          $anchor.parent.type.name === this.name
        ) {
          const blockId = node.attrs?.blockId || $anchor.parent.attrs?.blockId
          if (blockId && this.options.onBlockDelete) {
            this.options.onBlockDelete(blockId)
          }
          return editor.commands.deleteQuestionBlock(blockId)
        }

        return false
      }
    }
  }
})

