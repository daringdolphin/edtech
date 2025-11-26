/*
<ai_context>
Defines the evaluations table for storing grading results.
Supports AI and human evaluators with score, rubric breakdown, and feedback.
</ai_context>
*/

import {
  bigint,
  bigserial,
  boolean,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid
} from "drizzle-orm/pg-core"

import { answersTable } from "./answers-schema"

export const evaluatorTypeEnum = pgEnum("evaluator_type", [
  "ai",
  "teacher",
  "parent"
])

export const evaluationsTable = pgTable("evaluations", {
  id: bigserial("id", { mode: "number" }).primaryKey(),

  answerId: bigint("answer_id", { mode: "number" })
    .notNull()
    .references(() => answersTable.id, { onDelete: "cascade" }),

  evaluatorType: evaluatorTypeEnum("evaluator_type").notNull(),
  // "ai" | "teacher" | "parent"

  evaluatorId: uuid("evaluator_id"),
  // optional teacher/parent id when not AI

  score: numeric("score", { precision: 5, scale: 2 }).notNull(),
  maxMarks: integer("max_marks").notNull(),
  // copy from question_items.max_marks at grading time

  rubricBreakdown: jsonb("rubric_breakdown"),
  // per-criterion info, e.g. { criteria: [{ id, awarded, max }] }

  labels: text("labels")
    .array()
    .notNull()
    .default([]),
  // e.g. ["fraction_addition_error", "forgot_common_denominator"]

  modelName: text("model_name"),
  modelVersion: text("model_version"),
  promptVersion: text("prompt_version"),

  // Optional snapshot of question context at evaluation time
  questionSnapshot: jsonb("question_snapshot"),
  // e.g. { questionText, sampleAnswer, rubric }

  feedbackStudent: text("feedback_student"),
  // natural language explanation aimed at the student, derived from score and rubric breakdown

  isFinal: boolean("is_final").notNull().default(true),
  // If multiple evaluations per answer, only one should be final

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date())
})

export type InsertEvaluation = typeof evaluationsTable.$inferInsert
export type SelectEvaluation = typeof evaluationsTable.$inferSelect

