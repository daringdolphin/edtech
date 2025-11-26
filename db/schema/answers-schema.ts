/*
<ai_context>
Defines the answers table representing a student's response to a question.
Separates submission state (student-controlled) from grading state (system-controlled).
</ai_context>
*/

import {
  bigint,
  bigserial,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar
} from "drizzle-orm/pg-core"

import { papersTable } from "./papers-schema"
import { questionItemsTable } from "./question-items-schema"

export const gradingStatusEnum = pgEnum("grading_status", [
  "pending",
  "in_progress",
  "graded",
  "failed"
])

export const submissionStatusEnum = pgEnum("submission_status", [
  "draft",
  "submitted"
])

export const answerModeEnum = pgEnum("answer_mode", [
  "practice",
  "exam",
  "homework"
])

export const answersTable = pgTable("answers", {
  id: bigserial("id", { mode: "number" }).primaryKey(),

  studentId: uuid("student_id").notNull(),

  questionItemId: bigint("question_item_id", { mode: "number" })
    .notNull()
    .references(() => questionItemsTable.id, { onDelete: "restrict" }),

  paperId: bigint("paper_id", { mode: "number" }).references(
    () => papersTable.id,
    {
      onDelete: "set null"
    }
  ),

  attemptNumber: integer("attempt_number").notNull().default(1),

  mode: answerModeEnum("mode").notNull().default("practice"),
  // "practice" | "exam" | "homework"

  // AnswerArtifact links maintained in answerArtifactLinks join table

  canonicalText: text("canonical_text"),
  // post-OCR + optionally student-edited canonical answer text

  submissionStatus: submissionStatusEnum("submission_status")
    .notNull()
    .default("draft"),
  // "draft" | "submitted" — AI pipeline only triggers when "submitted"

  gradingStatus: gradingStatusEnum("grading_status").notNull().default("pending"),
  // "pending" | "in_progress" | "graded" | "failed"

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date())
})

export type InsertAnswer = typeof answersTable.$inferInsert
export type SelectAnswer = typeof answersTable.$inferSelect

