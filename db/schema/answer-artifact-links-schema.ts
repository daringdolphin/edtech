/*
<ai_context>
Defines the answer_artifact_links join table.
Links answers to artifacts with ordering support.
</ai_context>
*/

import {
  bigint,
  integer,
  pgTable,
  primaryKey,
  timestamp,
  uniqueIndex
} from "drizzle-orm/pg-core"

import { answerArtifactsTable } from "./answer-artifacts-schema"
import { answersTable } from "./answers-schema"

export const answerArtifactLinksTable = pgTable(
  "answer_artifact_links",
  {
    answerId: bigint("answer_id", { mode: "number" })
      .notNull()
      .references(() => answersTable.id, { onDelete: "cascade" }),

    artifactId: bigint("artifact_id", { mode: "number" })
      .notNull()
      .references(() => answerArtifactsTable.id, { onDelete: "cascade" }),

    position: integer("position").notNull().default(0),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date())
  },
  table => ({
    pk: primaryKey({ columns: [table.answerId, table.artifactId] }),
    answerPositionIdx: uniqueIndex(
      "answer_artifact_links_answer_id_position_idx"
    ).on(table.answerId, table.position)
  })
)

export type InsertAnswerArtifactLink =
  typeof answerArtifactLinksTable.$inferInsert
export type SelectAnswerArtifactLink =
  typeof answerArtifactLinksTable.$inferSelect

