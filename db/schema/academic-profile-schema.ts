/*
<ai_context>
Defines the user academic profile tables.
Includes user_academic_profiles (main profile), user_subject_levels, user_topics, and user_subtopics (join tables).
Users can select multiple subject-levels, topics, and subtopics, with default preferences.
</ai_context>
*/

import {
  bigserial,
  jsonb,
  pgTable,
  timestamp,
  uuid,
  uniqueIndex
} from "drizzle-orm/pg-core"

import {
  curriculumFrameworksTable,
  subjectLevelsTable,
  subjectTopicsTable,
  subjectSubtopicsTable
} from "./academic-taxonomy-schema"

export const userAcademicProfilesTable = pgTable("user_academic_profiles", {
  userId: uuid("user_id").primaryKey(), // auth.users.id

  frameworkId: uuid("framework_id")
    .notNull()
    .references(() => curriculumFrameworksTable.id, { onDelete: "restrict" }),

  // Default preferences
  preferredSubjectLevelId: uuid("preferred_subject_level_id").references(
    () => subjectLevelsTable.id,
    { onDelete: "set null" }
  ),
  currentTopicId: uuid("current_topic_id").references(
    () => subjectTopicsTable.id,
    { onDelete: "set null" }
  ),

  metadata: jsonb("metadata").notNull().default({}),
  // Future role-specific flags, preferences, etc.

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date())
})

export const userSubjectLevelsTable = pgTable(
  "user_subject_levels",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    userId: uuid("user_id")
      .notNull()
      .references(() => userAcademicProfilesTable.userId, {
        onDelete: "cascade"
      }),

    subjectLevelId: uuid("subject_level_id")
      .notNull()
      .references(() => subjectLevelsTable.id, { onDelete: "cascade" }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date())
  },
  table => ({
    userSubjectLevelIdx: uniqueIndex("user_subject_levels_user_id_subject_level_id_idx").on(
      table.userId,
      table.subjectLevelId
    )
  })
)

export const userTopicsTable = pgTable(
  "user_topics",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    userId: uuid("user_id")
      .notNull()
      .references(() => userAcademicProfilesTable.userId, {
        onDelete: "cascade"
      }),

    topicId: uuid("topic_id")
      .notNull()
      .references(() => subjectTopicsTable.id, { onDelete: "cascade" }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date())
  },
  table => ({
    userTopicIdx: uniqueIndex("user_topics_user_id_topic_id_idx").on(
      table.userId,
      table.topicId
    )
  })
)

export const userSubtopicsTable = pgTable(
  "user_subtopics",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    userId: uuid("user_id")
      .notNull()
      .references(() => userAcademicProfilesTable.userId, {
        onDelete: "cascade"
      }),

    subtopicId: uuid("subtopic_id")
      .notNull()
      .references(() => subjectSubtopicsTable.id, { onDelete: "cascade" }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date())
  },
  table => ({
    userSubtopicIdx: uniqueIndex("user_subtopics_user_id_subtopic_id_idx").on(
      table.userId,
      table.subtopicId
    )
  })
)

export type InsertUserAcademicProfile = typeof userAcademicProfilesTable.$inferInsert
export type SelectUserAcademicProfile = typeof userAcademicProfilesTable.$inferSelect

export type InsertUserSubjectLevel = typeof userSubjectLevelsTable.$inferInsert
export type SelectUserSubjectLevel = typeof userSubjectLevelsTable.$inferSelect

export type InsertUserTopic = typeof userTopicsTable.$inferInsert
export type SelectUserTopic = typeof userTopicsTable.$inferSelect

export type InsertUserSubtopic = typeof userSubtopicsTable.$inferInsert
export type SelectUserSubtopic = typeof userSubtopicsTable.$inferSelect
