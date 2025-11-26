
# 1. Overview

We’re building the **foundational backend + basic data model** for an edtech product that uses AI to grade student answers and generate feedback.

Core idea for this phase:

> A student selects a question (typically from a paper/worksheet), uploads their answer (image or similar), and the system stores that answer and an AI-generated evaluation (score + feedback).

This spec covers:

* Tech stack + architecture for v0 (Next.js + Supabase + Drizzle ORM).
* Initial database schema.
* Core data flow for “upload answer → store → AI evaluation → read result”.
* Design decisions and future-facing considerations (blocks, roles, analytics, basic RLS).

Out of scope for this phase:

* Question “block” editor (Notion-style builder).
* Role system (student/parent/teacher permissions beyond simple RLS).
* Class management, assignments, dashboards.
* Actual AI model integration (we just define how evaluation data is stored).

---

# 2. Goals & Non-goals

## Goals (v0)

1. **Have a working data model** in Supabase/Postgres that supports:

   * Question bank (questions and papers).
   * Student answers (with artifacts).
   * Evaluations (AI grading + feedback).

2. **Set up a standard TypeScript/Drizzle schema** for these tables.

3. **Provide basic scaffolding** for:

   * Next.js app (App Router).
   * Supabase client integration (server + client).
   * Drizzle integration (migrations, typed schema, DB client).

4. **Design for extension**, so that later we can:

   * Add question “blocks” (rich builder).
   * Add roles/ACL and more nuanced RLS.
   * Add analytics and dashboards.
   * Add more advanced AI pipelines and re-grading.

## Non-goals (v0)

* No question block primitives yet; questions are just text + image references + rubric.
* No assignment/submission workflows (classes, homework sets, deadlines).
* No complex API orchestration or queues.
* No aggressive DB performance/denormalisation work up front.
* No full question versioning; we accept that editing questions may affect interpretation of past grades.

---

# 3. User Types & Core Flows (Conceptual)

For now users are treated generically (all via Supabase auth); formal role semantics are deferred, but we assume **RLS** will still enforce “students only see their own answers”.

### 3.1 Conceptual users

* **Teacher/Content creator**

  * Creates questions.
  * Assembles questions into papers/worksheets.
* **Student**

  * Picks a paper and question.
  * Uploads answer (image, photo, or eventually canvas/typed).
  * Explicitly submits when ready (vs. staying in draft).
* **(AI/Grader)**

  * Consumes submitted, ungraded answers.
  * Writes back evaluations.

### 3.2 Core v0 flows

**Flow A: Teacher creates questions and a paper**

* Create `QuestionItem` records (with metadata + text + image references + rubric).
* Create a `Paper` record.
* Link questions to the paper via `PaperQuestionItem` with order.

**Flow B: Student uploads an answer for a question**

* Student selects a question (and optionally paper context).

* Student uploads image file (from upload or camera).

  * Frontend uploads directly to **Supabase Storage**.
  * Frontend receives the storage path/key.

* Backend (server action / API):

  * Receives storage path and metadata.
  * Creates an `AnswerArtifact` record referencing the storage path.
  * Creates or updates an `Answer` referencing the artifact(s) and question/paper.
  * Initially `submission_status = "draft"`.

**Flow C: Student submits answer**

* Student confirms when the answer is ready to be graded (e.g. presses “Submit”).
* Backend flips `answers.submission_status` from `draft` → `submitted`.
* Backend sets `grading_status = "pending"` for newly submitted answers.

**Flow D: AI grader writes an evaluation**

* A background process (or dev tool) reads answers where:

  * `submission_status = 'submitted'` and
  * `grading_status = 'pending'`.

* For each such answer:

  * Optionally fetches OCR (`extracted_text`) and canonical text (`canonical_text`).
  * Generates score + feedback using the question’s rubric/sample answer.
  * Writes an `Evaluation` record for that answer.
  * Sets `answers.grading_status = 'graded'` (or `failed` on error).

**Flow E: Client reads evaluation**

* Frontend queries for `Answer` + associated `Evaluation` to display score + feedback.
* Typically filters on `answers.student_id = auth.uid()` via RLS.

---

# 4. Architecture & Stack

### 4.1 Tech stack

* **Framework**: Next.js (v5+ with App Router).
* **Database**: Postgres via Supabase.
* **ORM**: Drizzle ORM (Postgres driver).
* **Auth**: Supabase Auth (users table, `auth.users`).
* **Storage**: Supabase Storage (for answer images and potentially question images).

### 4.2 Structure

* `db/schema.ts` – Drizzle table definitions.
* `db/client.ts` – Drizzle client instantiated with Supabase connection.
* `app/api/...` – API routes for basic operations (later).
* `lib/supabaseClient.ts` – Supabase client and helpers.

Primary deliverables for this ticket:

* `schema.ts` (Drizzle schema).
* Drizzle migrations applied to Supabase.
* Working DB connection in Next.js (simple test query).

### 4.3 Upload flow architecture

* **Client → Storage**: Files go **directly** from the browser to Supabase Storage.
* **Client → API/Server Action**: The backend receives only metadata + storage paths, never large blobs.
* This avoids serverless payload limits and unnecessary data copying.

### 4.4 RLS (Row Level Security) baseline

Although full roles are out of scope, we must design with **RLS**:

* `answers` / `answer_artifacts` / `answer_artifact_links`:

  * RLS policy: a user can `SELECT/UPDATE/DELETE` rows where `student_id = auth.uid()`.
  * AI/background job uses **service role key** (bypassing RLS) or a dedicated “grader” role.

* `question_items` and `papers`:

  * v0: read-only to all authenticated users (or a basic “owner or public” model via `created_by` + `visibility`).
  * Write access limited to `created_by = auth.uid()` or similar.

We won’t define the SQL in this spec, but the schema is designed with these policies in mind (`student_id`, `created_by`, `visibility` fields).

---

# 5. Data Model (DB schema, v0)

We implement **seven main tables**:

1. `question_items`
2. `papers`
3. `paper_question_items`
4. `answer_artifacts`
5. `answers`
6. `answer_artifact_links`
7. `evaluations`

Primary keys use `bigserial` across the board so every foreign key can share the same `bigint` type. Supabase Auth users use `uuid`. This simplifies joins and avoids cast mismatches.

Below snippets assume:

```ts
// src/db/schema.ts
import {
  pgTable,
  bigserial,
  bigint,
  text,
  varchar,
  integer,
  timestamp,
  uuid,
  jsonb,
  numeric,
  primaryKey,
  uniqueIndex,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
```

### 5.1 QuestionItem

Smallest gradable unit (a question or a sub-part like “3(b)”).

Supports:

* Metadata (subject, level, topics, tags, source).
* Text content and references to images (URLs or storage paths).
* Rubric and sample answer so the AI has ground truth.
* Forward-compatible with later block-based representation.

```ts
export const questionType = ["mcq", "short_answer", "structured"] as const;

export const questionItems = pgTable("question_items", {
  id: bigserial("id").primaryKey(),

  parentId: bigint("parent_id", { mode: "number" }).references(
    () => questionItems.id,
    { onDelete: "cascade" },
  ),

  label: text("label"), // e.g. "Q3b" for display

  // Metadata
  subject: varchar("subject", { length: 64 }).notNull(),
  level: varchar("level", { length: 64 }).notNull(), // e.g. "P5", "Sec3"
  topics: text("topics").array().notNull().default([]),
  source: text("source"), // e.g. "School X 2022 SA2"
  qType: varchar("q_type", { length: 32 }).notNull(), // from questionType
  tags: text("tags").array().notNull().default([]),

  // Content (simple for v0; blocks later)
  context: text("context"), // optional stem/passage text
  questionText: text("question_text").notNull(),
  referenceImages: text("reference_images").array().notNull().default([]),
  // store URLs or storage paths

  maxMarks: integer("max_marks").notNull(),

  // Grading hints and ground truth for AI + teachers
  gradingGuideline: text("grading_guideline"),
  // free-form notes: "Look for mention of photosynthesis"
  modelAnswer: text("model_answer"),
  // model/ideal answer text
  rubric: jsonb("rubric"),
  // optional structured rubric, e.g. { criteria: [{ id, label, maxMarks }] }

  createdBy: uuid("created_by"), // auth.users.id
  visibility: varchar("visibility", { length: 32 })
    .notNull()
    .default("private"), // "private" | "org" | "public"

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
```

Notes:

* `label` + `position` from `paper_question_items` together handle complex numbering like “3(a)”.
* `rubric` can be evolved without schema changes (add more fields to the JSON structure later).

### 5.2 Paper & PaperQuestionItem

A paper/worksheet is an ordered collection of question items. Paper is a thin composition layer.

```ts
export const papers = pgTable("papers", {
  id: bigserial("id").primaryKey(),

  title: text("title").notNull(),
  subject: varchar("subject", { length: 64 }),
  level: varchar("level", { length: 64 }),
  source: text("source"), // e.g. "Mid-Year Exam 2024"

  totalMarks: integer("total_marks"), // optional denorm

  createdBy: uuid("created_by"),
  visibility: varchar("visibility", { length: 32 })
    .notNull()
    .default("private"),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const paperQuestionItems = pgTable(
  "paper_question_items",
  {
    paperId: bigint("paper_id", { mode: "number" })
      .notNull()
      .references(() => papers.id, { onDelete: "cascade" }),

    questionItemId: bigint("question_item_id", { mode: "number" })
      .notNull()
      .references(() => questionItems.id, { onDelete: "restrict" }),

    position: integer("position").notNull(), // order in paper
    pageStart: integer("page_start"), // 1-based page number, nullable
    pageEnd: integer("page_end"), // inclusive; nullable

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.paperId, table.questionItemId] }),
    perPaperPositionIdx: uniqueIndex(
      "paper_question_items_paper_id_position_idx",
    ).on(table.paperId, table.position),
  }),
);
```

Usage:

* Sort by `position` for rendering order.
* Display `question_items.label` for numbering (“Q1”, “Q3b”, etc.).

### 5.3 AnswerArtifact

Represents the **raw uploaded content** for an answer, usually an image.

Supports:

* Uploaded image (file picker).
* Camera photo.
* (Later) canvas-generated artifact (+ optional raw JSON).

```ts
export const artifactType = ["image", "text"] as const;
export const artifactSource = ["upload", "camera", "canvas"] as const;

export const answerArtifacts = pgTable("answer_artifacts", {
  id: bigserial("id").primaryKey(),

  studentId: uuid("student_id").notNull(), // supabase auth.user id

  artifactType: varchar("artifact_type", { length: 32 }).notNull(),
  // "image" | "text" for now

  source: varchar("source", { length: 32 }).notNull(),
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
    .$onUpdate(() => new Date()),
});
```

OCR data flow:

* Image artifacts may be processed by an OCR service.
* OCR writes to `answer_artifacts.extracted_text`.
* `answers.canonical_text` is the post-OCR, student-edited canonical version for grading.

### 5.4 Answer

Represents **a student’s response** to a specific question item (and optionally within a paper context), across attempts.

We explicitly separate:

* **Submission state** – controlled by the student (“draft” vs “submitted”).
* **Grading state** – controlled by the backend/AI (“pending”, “in_progress”, “graded”, “failed”).

```ts
export const gradingStatus = [
  "pending",
  "in_progress",
  "graded",
  "failed",
] as const;

export const submissionStatus = ["draft", "submitted"] as const;

export const answerMode = ["practice", "exam", "homework"] as const;

export const answers = pgTable("answers", {
  id: bigserial("id").primaryKey(),

  studentId: uuid("student_id").notNull(),

  questionItemId: bigint("question_item_id", { mode: "number" })
    .notNull()
    .references(() => questionItems.id, { onDelete: "restrict" }),

  paperId: bigint("paper_id", { mode: "number" }).references(() => papers.id, {
    onDelete: "set null",
  }),

  attemptNumber: integer("attempt_number").notNull().default(1),

  mode: varchar("mode", { length: 32 }).notNull().default("practice"),
  // "practice" | "exam" | "homework"

  // AnswerArtifact links maintained in answerArtifactLinks join table

  canonicalText: text("canonical_text"),
  // post-OCR + optionally student-edited canonical answer text

  submissionStatus: varchar("submission_status", { length: 32 })
    .notNull()
    .default("draft"),
  // "draft" | "submitted" — AI pipeline only triggers when "submitted"

  gradingStatus: varchar("grading_status", { length: 32 })
    .notNull()
    .default("pending"),
  // "pending" | "in_progress" | "graded" | "failed"

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
```

Notes:

* Background grader should only consider rows where `submission_status = 'submitted'` and `grading_status = 'pending'`.
* Retrying failed evaluations: set `grading_status` back to `pending`.

### 5.5 AnswerArtifactLink

Links each `Answer` to one or more `AnswerArtifacts` while maintaining explicit ordering and referential integrity.

```ts
export const answerArtifactLinks = pgTable(
  "answer_artifact_links",
  {
    answerId: bigint("answer_id", { mode: "number" })
      .notNull()
      .references(() => answers.id, { onDelete: "cascade" }),

    artifactId: bigint("artifact_id", { mode: "number" })
      .notNull()
      .references(() => answerArtifacts.id, { onDelete: "cascade" }),

    position: integer("position").notNull().default(0),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.answerId, table.artifactId] }),
    answerPositionIdx: uniqueIndex(
      "answer_artifact_links_answer_id_position_idx",
    ).on(table.answerId, table.position),
  }),
);
```

Notes:

* Multiple artifacts per answer (e.g. multiple pages) with guaranteed ordering.
* Cascades clean up links when either the `answer` or `artifact` is deleted.

### 5.6 Evaluation

Represents **one grading pass** on an Answer by some evaluator (AI or human).

Stores:

* Score and max marks (denormalised from question).
* Rubric breakdown (JSON).
* Error labels.
* Model metadata / prompt version.
* Student-facing feedback.
* Optional snapshot of the question context at grading time.

```ts
export const evaluatorType = ["ai", "teacher", "parent"] as const;

export const evaluations = pgTable("evaluations", {
  id: bigserial("id").primaryKey(),

  answerId: bigint("answer_id", { mode: "number" })
    .notNull()
    .references(() => answers.id, { onDelete: "cascade" }),

  evaluatorType: varchar("evaluator_type", { length: 32 }).notNull(),
  // "ai" | "teacher" | "parent"

  evaluatorId: uuid("evaluator_id"),
  // optional teacher/parent id when not AI

  score: numeric("score", { precision: 5, scale: 2 }).notNull(),
  maxMarks: integer("max_marks").notNull(),
  // copy from question_items.max_marks at grading time

  rubricBreakdown: jsonb("rubric_breakdown"),
  // per-criterion info, e.g. { criteria: [{ id, awarded, max }] }

  labels: text("labels").array().notNull().default([]),
  // e.g. ["fraction_addition_error", "forgot_common_denominator"]

  modelName: text("model_name"),
  modelVersion: text("model_version"),
  promptVersion: text("prompt_version"),

  // Optional snapshot of question context at evaluation time
  questionSnapshot: jsonb("question_snapshot"),
  // e.g. { questionText, sampleAnswer, rubric }

  feedbackStudent: text("feedback_student"),
  // natural language explanation aimed at the student

  isFinal: boolean("is_final").notNull().default(true),
  // If multiple evaluations per answer, only one should be final

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
```

Notes:

* We can re-grade answers with new models; existing records remain for audit/experiments.
* `modelName` + `modelVersion` + `promptVersion` together act as a “config identifier”, enabling A/B analysis later.
* `questionSnapshot` is optional but gives us an escape hatch for future versioning without schema changes.

---

# 6. Key Design Decisions & Considerations

### 6.1 Question granularity: QuestionItem (with parentId)

* We grade at the level of `QuestionItem` (smallest unit):

  * Top-level Q1, or subpart Q1(b).

* `parentId` for subparts instead of separate tables.

* Allows:

  * Simple per-question answer flows.
  * Multi-part questions without schema churn.
  * Re-use of subparts across different papers if needed.

### 6.2 Paper as a thin composition layer

* `papers` + `paper_question_items` gives:

  * Reusable questions across papers.
  * Ordered questions in a paper.

* For v0, papers are optional context; a student can answer a question without a paper.

### 6.3 No question blocks yet, but future-proofing

* For now, question content is:

  * `context` (text), `questionText`, `referenceImages[]`, `sampleAnswer`, `rubric`.

* When we add a Notion-style builder:

  * Introduce a `question_blocks` table and pivot content out.
  * Existing `context/questionText/referenceImages/sampleAnswer/rubric` can be migrated or mirrored into blocks.
  * `questionSnapshot` on `evaluations` ensures existing grades remain interpretable even if the live question changes.

### 6.4 Answer vs AnswerArtifact separation

* `AnswerArtifact` = how the answer was **captured** (image, camera, canvas, text).
* `Answer` = what we’re **grading** (student + question + attempt).
* Associations live in `answer_artifact_links` so Postgres enforces FKs and cascading cleanup, while preserving per-answer artifact order.

This separation allows:

* Multiple artifacts per Answer.
* Flexible input modes now (upload/photo) and later (canvas, typed).
* Clean OCR pipeline (per artifact) and a single `canonicalText` per answer.

### 6.5 Submission vs grading state

* `submissionStatus` is controlled by the **student**:

  * `draft`: the student is editing or re-uploading artifacts.
  * `submitted`: the student has indicated they are done.

* `gradingStatus` is controlled by the **system**:

  * `pending`: waiting in the grading queue.
  * `in_progress`: currently being graded.
  * `graded`: evaluation exists.
  * `failed`: grading failed (e.g. model error; can be retried).

AI jobs must only process rows where:

* `submission_status = 'submitted'`, and
* `grading_status = 'pending'`.

This avoids wasting tokens on half-finished drafts.

### 6.6 Evaluation separate from Answer

* `Evaluation` is separate from `Answer` so we can:

  * Re-grade with new models.
  * Allow teacher override later while keeping AI grades for reference.
  * Support multiple evaluations per answer (e.g. AI + teacher) and mark one as final.

* `questionSnapshot` loosens coupling between evaluation and the current question text.

### 6.7 Performance & joins (high level)

* For v0, we do **not** denormalize heavily.

* Typical queries:

  * Per-question performance: `answers → evaluations`, joined to `question_items`.
  * Per-paper student performance: `answers → evaluations → paper_question_items → papers`.

* If needed later:

  * Denorm `subject/level` onto `answers` for easier filtering.
  * Add materialized views for analytics.

Correctness and flexibility take precedence over micro-optimisation in v0.

### 6.8 RLS and security

* The schema exposes clear ownership fields (`studentId`, `createdBy`, `visibility`) to support:

  * “Students can only see their own answers/artifacts.”
  * “Teachers can see all answers for their own questions/papers” (future).
  * “AI background jobs can bypass RLS with a service role key.”

* This is essential because Supabase client-side access depends on RLS; we cannot punt this entirely to later without compromising security.

---

# 7. Implementation Plan / Tasks

5. **Create `db/schema.ts`** with tables from section 5.

7. **Run Drizzle migrations**:

   * `npx drizzle-kit generate`
   * `npx drizzle-kit push` (or equivalent workflow) to create tables in Supabase.

### 7.2 Minimal domain operations (for future APIs/UI)

We will not be implementing these  now, but schema is designed to support these in the future:

* **Teacher/content creation**

  * Create `question_items`.
  * Create `papers` and `paper_question_items`.

* **Student answering**

  * Client uploads image/text to Supabase Storage.

  * Backend endpoint to:

    * Create `answer_artifacts`.
    * Upsert `answers` (draft state).
    * Link artifacts via `answer_artifact_links`.

  * Endpoint to mark an answer as `submitted`.

* **AI grading**

  * Background worker (or dev script) to:

    * Fetch answers: `submission_status = 'submitted'` and `grading_status = 'pending'`.
    * Read question, rubric, sample answer.
    * Read artifacts / canonicalText.
    * Call AI model, then create `evaluations`.
    * Update `answers.grading_status` accordingly.

* **Result retrieval**

  * Query answers with their latest `evaluations` for:

    * A given student (via `student_id`).
    * A given paper (`paper_id`) or question (`question_item_id`).

### 7.3 RLS setup (minimal)

* Enable RLS on all tables.

* Policies (conceptual, SQL not included here):

  * `answers`, `answer_artifacts`, `answer_artifact_links`:

    * `USING (student_id = auth.uid())` for `SELECT/UPDATE/DELETE`.
    * `WITH CHECK (student_id = auth.uid())` for `INSERT`.

  * `question_items`, `papers`, `paper_question_items`:

    * Basic read-only policy for all authenticated users.
    * Stricter write policy keyed off `created_by`.

* Background grading uses the Supabase **service role key** and is not constrained by RLS.

---

# 8. Acceptance Criteria

1. **Schema in Supabase**

   * All seven tables created as per the updated spec.
   * Migrations tracked via Drizzle (`drizzle` directory).

2. **Type-safe Drizzle schema**

   * `schema.ts` compiles (no type errors).
   * `db` client imports `schema.ts` and can perform a simple query in a test route (e.g. select from `question_items`).

3. **Submission/grading pipeline clarity**

   * `answers.submission_status` and `answers.grading_status` exist and are used distinctly in code.
   * Background grading logic filters on `submitted + pending` only.

4. **AI-ready question representation**

   * `question_items` includes `sample_answer` and `rubric` in addition to `max_marks` and `grading_guideline`.
   * `evaluations` store `max_marks` and model/prompt metadata.

5. **Future extensions remain feasible without breaking changes**

   * We can later:

     * Add `question_blocks`.
     * Add richer roles/user tables and ACL.
     * Add assignment/submission tables and class management.
     * Add analytics materialized views.

   * Without having to fundamentally redesign `QuestionItem`, `Answer`, or `Evaluation`.