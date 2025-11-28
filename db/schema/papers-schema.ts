/*
<ai_context>
Defines the papers table and paper_blocks table.
A paper/worksheet is a TipTap-powered template composed of ordered blocks,
where question blocks reference canonical question_items.
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
  uniqueIndex,
  uuid,
  varchar
} from "drizzle-orm/pg-core"

import { questionItemsTable, visibilityEnum } from "./question-items-schema"

export const paperBlockTypeEnum = pgEnum("paper_block_type", [
  "question",
  "heading",
  "text",
  "image",
  "logo",
  "spacer",
  "divider"
])

export const papersTable = pgTable("papers", {
  id: bigserial("id", { mode: "number" }).primaryKey(),

  title: text("title").notNull(),
  subject: varchar("subject", { length: 64 }),
  level: varchar("level", { length: 64 }),
  source: text("source"), // e.g. "Mid-Year Exam 2024"

  totalMarks: integer("total_marks"), // optional denorm

  contentDoc: jsonb("content_doc").notNull().default({}),
  contentHtml: text("content_html").notNull().default(""),
  contentPlain: text("content_plain").notNull().default(""),
  contentVersion: varchar("content_version", { length: 32 })
    .notNull()
    .default("tiptap_v1"),

  headerDoc: jsonb("header_doc").notNull().default({}),
  footerDoc: jsonb("footer_doc").notNull().default({}),
  branding: jsonb("branding").notNull().default({}),
  pageSettings: jsonb("page_settings").notNull().default({}),

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

export const paperBlocksTable = pgTable(
  "paper_blocks",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),

    paperId: bigint("paper_id", { mode: "number" })
      .notNull()
      .references(() => papersTable.id, { onDelete: "cascade" }),

    blockType: paperBlockTypeEnum("block_type").notNull(),
    position: integer("position").notNull(),

    questionItemId: bigint("question_item_id", { mode: "number" }).references(
      () => questionItemsTable.id,
      { onDelete: "cascade" }
    ),

    blockDoc: jsonb("block_doc").notNull().default({}),
    blockHtml: text("block_html").notNull().default(""),
    blockPlain: text("block_plain").notNull().default(""),
    blockVersion: varchar("block_version", { length: 32 })
      .notNull()
      .default("tiptap_v1"),

    overrides: jsonb("overrides").notNull().default({}),
    meta: jsonb("meta").notNull().default({}),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date())
  },
  table => ({
    perPaperPositionIdx: uniqueIndex(
      "paper_blocks_paper_id_position_idx"
    ).on(table.paperId, table.position),
    uniqueQuestionPerPaperIdx: uniqueIndex(
      "paper_blocks_paper_id_question_item_id_idx"
    ).on(table.paperId, table.questionItemId)
  })
)

export type InsertPaper = typeof papersTable.$inferInsert
export type SelectPaper = typeof papersTable.$inferSelect

export type InsertPaperBlock = typeof paperBlocksTable.$inferInsert
export type SelectPaperBlock = typeof paperBlocksTable.$inferSelect

