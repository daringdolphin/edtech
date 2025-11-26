/*
<ai_context>
Defines the answer_artifacts table for storing raw uploaded content.
Supports images, text, and future canvas/whiteboard artifacts.
</ai_context>
*/

import {
  bigserial,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar
} from "drizzle-orm/pg-core"

export const artifactTypeEnum = pgEnum("artifact_type", ["image", "text"])

export const artifactSourceEnum = pgEnum("artifact_source", [
  "upload",
  "camera",
  "canvas"
])

export const answerArtifactsTable = pgTable("answer_artifacts", {
  id: bigserial("id", { mode: "number" }).primaryKey(),

  studentId: uuid("student_id").notNull(), // supabase auth.user id

  artifactType: artifactTypeEnum("artifact_type").notNull(),
  // "image" | "text" for now

  source: artifactSourceEnum("source").notNull(),
  // "upload" | "camera" | "canvas"

  storageUrl: text("storage_url").notNull(),
  // Supabase Storage path or public URL

  extractedText: text("extracted_text"),
  // OCR text if available (image -> text pipeline)

  // For canvas/whiteboard in future:
  rawPayload: jsonb("raw_payload"),
  // optional original JSON for re-editing (e.g. whiteboard strokes)

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date())
})

export type InsertAnswerArtifact = typeof answerArtifactsTable.$inferInsert
export type SelectAnswerArtifact = typeof answerArtifactsTable.$inferSelect

