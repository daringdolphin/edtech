/*
<ai_context>
Defines the academic taxonomy tables for curriculum frameworks (Singapore MOE).
Includes curriculum_frameworks, framework_subjects, subject_levels, subject_topics, and subject_subtopics.
These tables are read-only and populated via seed scripts.
</ai_context>
*/

import {
  bigserial,
  bigint,
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  uniqueIndex
} from "drizzle-orm/pg-core"

export const curriculumFrameworksTable = pgTable("curriculum_frameworks", {
  id: uuid("id").primaryKey().defaultRandom(),

  name: varchar("name", { length: 128 }).notNull(), // e.g. "Singapore MOE"
  region: varchar("region", { length: 64 }).notNull(), // e.g. "Singapore"
  version: varchar("version", { length: 32 }).notNull(), // e.g. "sg_moe_2024"

  gradeBands: jsonb("grade_bands").notNull().default({}),
  // Structure: { primary: { label: "Primary", levels: ["P1", "P2", ...] }, ... }

  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date())
})

export const frameworkSubjectsTable = pgTable(
  "framework_subjects",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    frameworkId: uuid("framework_id")
      .notNull()
      .references(() => curriculumFrameworksTable.id, { onDelete: "cascade" }),

    subjectKey: varchar("subject_key", { length: 64 }).notNull(), // e.g. "mathematics"
    displayName: varchar("display_name", { length: 128 }).notNull(), // e.g. "Mathematics"
    description: text("description"),

    sequence: integer("sequence").notNull().default(0), // For ordering in UI

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date())
  },
  table => ({
    frameworkSubjectKeyIdx: uniqueIndex("framework_subjects_framework_id_subject_key_idx").on(
      table.frameworkId,
      table.subjectKey
    )
  })
)

export const subjectLevelsTable = pgTable(
  "subject_levels",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    frameworkSubjectId: uuid("framework_subject_id")
      .notNull()
      .references(() => frameworkSubjectsTable.id, { onDelete: "cascade" }),

    levelKey: varchar("level_key", { length: 64 }).notNull(), // e.g. "primary_p5"
    displayName: varchar("display_name", { length: 128 }).notNull(), // e.g. "Primary 5"
    stream: varchar("stream", { length: 64 }), // e.g. "Express", "Normal Academic", null for primary

    sequence: integer("sequence").notNull().default(0), // For ordering in UI

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date())
  },
  table => ({
    subjectLevelKeyIdx: uniqueIndex("subject_levels_framework_subject_id_level_key_idx").on(
      table.frameworkSubjectId,
      table.levelKey
    )
  })
)

export const subjectTopicsTable = pgTable(
  "subject_topics",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    subjectLevelId: uuid("subject_level_id")
      .notNull()
      .references(() => subjectLevelsTable.id, { onDelete: "cascade" }),

    code: varchar("code", { length: 32 }).notNull(), // e.g. "MA-P5-04"
    name: varchar("name", { length: 256 }).notNull(), // e.g. "Fractions"
    strand: varchar("strand", { length: 128 }), // e.g. "Number & Algebra"
    description: text("description"),

    sequence: integer("sequence").notNull().default(0),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date())
  },
  table => ({
    topicCodeIdx: uniqueIndex("subject_topics_subject_level_id_code_idx").on(
      table.subjectLevelId,
      table.code
    )
  })
)

export const subjectSubtopicsTable = pgTable(
  "subject_subtopics",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    topicId: uuid("topic_id")
      .notNull()
      .references(() => subjectTopicsTable.id, { onDelete: "cascade" }),

    code: varchar("code", { length: 32 }).notNull(), // e.g. "MA-P5-04-02"
    name: varchar("name", { length: 256 }).notNull(),
    learningObjectives: jsonb("learning_objectives").notNull().default([]),

    sequence: integer("sequence").notNull().default(0),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date())
  },
  table => ({
    subtopicCodeIdx: uniqueIndex("subject_subtopics_topic_id_code_idx").on(
      table.topicId,
      table.code
    )
  })
)

export type InsertCurriculumFramework = typeof curriculumFrameworksTable.$inferInsert
export type SelectCurriculumFramework = typeof curriculumFrameworksTable.$inferSelect

export type InsertFrameworkSubject = typeof frameworkSubjectsTable.$inferInsert
export type SelectFrameworkSubject = typeof frameworkSubjectsTable.$inferSelect

export type InsertSubjectLevel = typeof subjectLevelsTable.$inferInsert
export type SelectSubjectLevel = typeof subjectLevelsTable.$inferSelect

export type InsertSubjectTopic = typeof subjectTopicsTable.$inferInsert
export type SelectSubjectTopic = typeof subjectTopicsTable.$inferSelect

export type InsertSubjectSubtopic = typeof subjectSubtopicsTable.$inferInsert
export type SelectSubjectSubtopic = typeof subjectSubtopicsTable.$inferSelect
