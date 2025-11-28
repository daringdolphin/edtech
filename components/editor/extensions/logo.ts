/*
<ai_context>
Custom TipTap extension for a logo block.
Renders a centered logo image with alignment options.
</ai_context>
*/

import { Node, mergeAttributes, CommandProps } from "@tiptap/core"
import { Node as ProseMirrorNode } from "@tiptap/pm/model"

export interface LogoOptions {
  HTMLAttributes: Record<string, unknown>
}

interface LogoAttributes {
  src: string | null
  alt: string
  alignment: string
  width: number
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    logo: {
      setLogo: (options: { src: string; alt?: string }) => ReturnType
    }
  }
}

export const Logo = Node.create<LogoOptions>({
  name: "logo",

  group: "block",

  atom: true,

  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {}
    }
  },

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element: HTMLElement) =>
          element.querySelector("img")?.getAttribute("src"),
        renderHTML: () => ({})
      },
      alt: {
        default: "Logo",
        parseHTML: (element: HTMLElement) =>
          element.querySelector("img")?.getAttribute("alt"),
        renderHTML: () => ({})
      },
      alignment: {
        default: "center",
        parseHTML: (element: HTMLElement) =>
          element.getAttribute("data-alignment") || "center",
        renderHTML: (attributes: LogoAttributes) => ({
          "data-alignment": attributes.alignment
        })
      },
      width: {
        default: 200,
        parseHTML: (element: HTMLElement) => {
          const width = element.querySelector("img")?.getAttribute("width")
          return width ? parseInt(width, 10) : 200
        },
        renderHTML: () => ({})
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="logo"]'
      }
    ]
  },

  renderHTML({
    HTMLAttributes,
    node
  }: {
    HTMLAttributes: Record<string, unknown>
    node: ProseMirrorNode
  }) {
    const alignmentClass =
      {
        left: "justify-start",
        center: "justify-center",
        right: "justify-end"
      }[(node.attrs as LogoAttributes).alignment] || "justify-center"

    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "logo",
        class: `logo-block flex ${alignmentClass}`
      }),
      [
        "img",
        {
          src: node.attrs.src,
          alt: node.attrs.alt,
          width: node.attrs.width,
          class: "max-w-full h-auto"
        }
      ]
    ]
  },

  addCommands() {
    return {
      setLogo:
        (options: { src: string; alt?: string }) =>
        ({ commands }: CommandProps) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              src: options.src,
              alt: options.alt || "Logo"
            }
          })
        }
    }
  }
})

export default Logo

