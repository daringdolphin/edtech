/*
<ai_context>
Custom TipTap extension for a spacer block.
Renders an adjustable vertical spacing element.
</ai_context>
*/

import { Node, mergeAttributes, CommandProps } from "@tiptap/core"

export interface SpacerOptions {
  HTMLAttributes: Record<string, unknown>
  heights: number[]
  defaultHeight: number
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    spacer: {
      setSpacer: (options?: { height?: number }) => ReturnType
    }
  }
}

export const Spacer = Node.create<SpacerOptions>({
  name: "spacer",

  group: "block",

  atom: true,

  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
      heights: [16, 32, 48, 64, 96],
      defaultHeight: 32
    }
  },

  addAttributes() {
    return {
      height: {
        default: this.options.defaultHeight,
        parseHTML: (element: HTMLElement) => {
          const height = element.getAttribute("data-height")
          return height ? parseInt(height, 10) : this.options.defaultHeight
        },
        renderHTML: (attributes: { height: number }) => {
          return {
            "data-height": attributes.height,
            style: `height: ${attributes.height}px`
          }
        }
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="spacer"]'
      }
    ]
  },

  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, unknown> }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "spacer",
        class: "spacer-block"
      })
    ]
  },

  addCommands() {
    return {
      setSpacer:
        (options: { height?: number } = {}) =>
        ({ commands }: CommandProps) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              height: options.height || this.options.defaultHeight
            }
          })
        }
    }
  }
})

