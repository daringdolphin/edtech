/*
<ai_context>
Exports all editor components for the worksheet builder.
Organized into core, toolbar, extensions, and features.
</ai_context>
*/

// Main editor component
export { WorksheetEditor } from "./worksheet-editor"
export type { WorksheetEditorProps } from "./worksheet-editor"

// Core (provider, context, hooks)
export {
  EditorProvider,
  EditorContext,
  useEditorContext,
  useEditor,
  useQuestionBlockCallbacks
} from "./core"
export type {
  EditorProviderProps,
  EditorContextValue,
  QuestionBlockCallbacks
} from "./core"

// Toolbar
export {
  EditorToolbar,
  ToolbarButton,
  HistoryGroup,
  FormattingGroup,
  HeadingGroup,
  ListGroup,
  BlocksGroup,
  MediaGroup,
  QuestionMenu
} from "./toolbar"
export type { ToolbarButtonProps } from "./toolbar"

// Extensions
export {
  Spacer,
  Logo,
  QuestionBlock,
  buildWorksheetExtensions,
  getExtensionNames
} from "./extensions"
export type {
  SpacerOptions,
  LogoOptions,
  QuestionBlockOptions,
  WorksheetExtensionsConfig
} from "./extensions"

// Features (question block UI components)
export {
  QuestionBlockView,
  RichTextArea,
  AnswerSpace,
  MCQEditor,
  StructuredEditor,
  ShortAnswerEditor,
  EssayEditor
} from "./features"
