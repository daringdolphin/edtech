/*
<ai_context>
Defines the question_items table for storing gradable question units.
Supports metadata, content, rubric, and grading hints for AI evaluation.
</ai_context>
*/

import {
  bigint,
  bigserial,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar
} from "drizzle-orm/pg-core"

export const questionTypeEnum = pgEnum("question_type", [
  "mcq",
  "short_answer",
  "structured",
  "essay"
])

export const visibilityEnum = pgEnum("visibility", ["private", "org", "public"])

export const questionItemsTable = pgTable("question_items", {
  id: bigserial("id", { mode: "number" }).primaryKey(),

  parentId: bigint("parent_id", { mode: "number" }).references(
    (): any => questionItemsTable.id,
    { onDelete: "cascade" }
  ),

  label: text("label"), // e.g. "Q3b" for display

  // Metadata
  subject: varchar("subject", { length: 64 }).notNull(),
  level: varchar("level", { length: 64 }).notNull(), // e.g. "P5", "Sec3"
  topics: text("topics")
    .array()
    .notNull()
    .default([]),
  source: text("source"), // e.g. "School X 2022 SA2"
  qType: questionTypeEnum("q_type").notNull(),
  tags: text("tags")
    .array()
    .notNull()
    .default([]),

  // Content (simple for v0; blocks later)
  context: text("context"), // optional stem/passage text
  questionText: text("question_text").notNull(),
  referenceImages: text("reference_images")
    .array()
    .notNull()
    .default([]),
  // store URLs or storage paths

  maxMarks: integer("max_marks").notNull(),

  // Grading hints and ground truth for AI + teachers
  gradingGuidelines: text("grading_guidelines"),
  // free-form notes: "Look for mention of photosynthesis"
  modelAnswer: text("model_answer"),
  // model/ideal answer text
  rubric: jsonb("rubric"),

  createdBy: uuid("created_by"), // auth.users.id
  visibility: visibilityEnum("visibility").notNull().default("private"),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date())
})

export type InsertQuestionItem = typeof questionItemsTable.$inferInsert
export type SelectQuestionItem = typeof questionItemsTable.$inferSelect

