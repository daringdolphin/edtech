/*
<ai_context>
Exports the QuestionBlock feature module.
Includes the TipTap extension, NodeView, and UI components.
</ai_context>
*/

// Extension
export { QuestionBlock } from "./extension"
export type { QuestionBlockOptions } from "./extension"

// NodeView
export { QuestionBlockView } from "./node-view"

// UI Components
export { RichTextArea, AnswerSpace } from "./ui"

// Question Type Editors
export {
  MCQEditor,
  StructuredEditor,
  ShortAnswerEditor,
  EssayEditor
} from "./question-types"

