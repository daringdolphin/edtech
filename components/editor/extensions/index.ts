/*
<ai_context>
Exports all custom TipTap extensions for the worksheet editor.
Extensions are organized in folders with their own index files.
</ai_context>
*/

// Individual extensions
export { Spacer } from "./spacer"
export type { SpacerOptions } from "./spacer"

export { Logo } from "./logo"
export type { LogoOptions } from "./logo"

// Question block is exported from features for better organization
// but re-exported here for backward compatibility
export { QuestionBlock } from "../features/question-block"
export type { QuestionBlockOptions } from "../features/question-block"

// Registry for building extensions
export { buildWorksheetExtensions, getExtensionNames } from "./registry"
export type { WorksheetExtensionsConfig } from "./registry"
