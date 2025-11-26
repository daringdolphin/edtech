/*
<ai_context>
Defines the papers table and paper_question_items join table.
A paper/worksheet is an ordered collection of question items.
</ai_context>
*/

import {
  bigint,
  bigserial,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar
} from "drizzle-orm/pg-core"

import { questionItemsTable, visibilityEnum } from "./question-items-schema"

export const papersTable = pgTable("papers", {
  id: bigserial("id", { mode: "number" }).primaryKey(),

  title: text("title").notNull(),
  subject: varchar("subject", { length: 64 }),
  level: varchar("level", { length: 64 }),
  source: text("source"), // e.g. "Mid-Year Exam 2024"

  totalMarks: integer("total_marks"), // optional denorm

  createdBy: uuid("created_by"),
  visibility: visibilityEnum("visibility").notNull().default("private"),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date())
})

export const paperQuestionItemsTable = pgTable(
  "paper_question_items",
  {
    paperId: bigint("paper_id", { mode: "number" })
      .notNull()
      .references(() => papersTable.id, { onDelete: "cascade" }),

    questionItemId: bigint("question_item_id", { mode: "number" })
      .notNull()
      .references(() => questionItemsTable.id, { onDelete: "restrict" }),

    position: integer("position").notNull(), // order in paper
    pageStart: integer("page_start"), // 1-based page number, nullable
    pageEnd: integer("page_end"), // inclusive; nullable

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date())
  },
  table => ({
    pk: primaryKey({ columns: [table.paperId, table.questionItemId] }),
    perPaperPositionIdx: uniqueIndex(
      "paper_question_items_paper_id_position_idx"
    ).on(table.paperId, table.position)
  })
)

export type InsertPaper = typeof papersTable.$inferInsert
export type SelectPaper = typeof papersTable.$inferSelect

export type InsertPaperQuestionItem = typeof paperQuestionItemsTable.$inferInsert
export type SelectPaperQuestionItem = typeof paperQuestionItemsTable.$inferSelect

