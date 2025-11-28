DO $$ BEGIN
 CREATE TYPE "public"."question_type" AS ENUM('mcq', 'short_answer', 'structured', 'essay');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."visibility" AS ENUM('private', 'org', 'public');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."artifact_source" AS ENUM('upload', 'camera', 'canvas');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."artifact_type" AS ENUM('image', 'text');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."answer_mode" AS ENUM('practice', 'exam', 'homework');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."grading_status" AS ENUM('pending', 'in_progress', 'graded', 'failed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."submission_status" AS ENUM('draft', 'submitted');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."evaluator_type" AS ENUM('ai', 'teacher', 'parent');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "question_items" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"parent_id" bigint,
	"label" text,
	"subject" varchar(64) NOT NULL,
	"level" varchar(64) NOT NULL,
	"topics" text[] DEFAULT '{}' NOT NULL,
	"source" text,
	"q_type" "question_type" NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"context" text,
	"question_text" text NOT NULL,
	"reference_images" text[] DEFAULT '{}' NOT NULL,
	"max_marks" integer NOT NULL,
	"grading_guidelines" text,
	"model_answer" text,
	"rubric" jsonb,
	"created_by" uuid,
	"visibility" "visibility" DEFAULT 'private' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "paper_question_items" (
	"paper_id" bigint NOT NULL,
	"question_item_id" bigint NOT NULL,
	"position" integer NOT NULL,
	"page_start" integer,
	"page_end" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "paper_question_items_paper_id_question_item_id_pk" PRIMARY KEY("paper_id","question_item_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "papers" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"subject" varchar(64),
	"level" varchar(64),
	"source" text,
	"total_marks" integer,
	"created_by" uuid,
	"visibility" "visibility" DEFAULT 'private' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "answer_artifacts" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"student_id" uuid NOT NULL,
	"artifact_type" "artifact_type" NOT NULL,
	"source" "artifact_source" NOT NULL,
	"storage_url" text NOT NULL,
	"extracted_text" text,
	"raw_payload" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "answers" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"student_id" uuid NOT NULL,
	"question_item_id" bigint NOT NULL,
	"paper_id" bigint,
	"attempt_number" integer DEFAULT 1 NOT NULL,
	"mode" "answer_mode" DEFAULT 'practice' NOT NULL,
	"canonical_text" text,
	"submission_status" "submission_status" DEFAULT 'draft' NOT NULL,
	"grading_status" "grading_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "answer_artifact_links" (
	"answer_id" bigint NOT NULL,
	"artifact_id" bigint NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "answer_artifact_links_answer_id_artifact_id_pk" PRIMARY KEY("answer_id","artifact_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "evaluations" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"answer_id" bigint NOT NULL,
	"evaluator_type" "evaluator_type" NOT NULL,
	"evaluator_id" uuid,
	"score" numeric(5, 2) NOT NULL,
	"max_marks" integer NOT NULL,
	"rubric_breakdown" jsonb,
	"labels" text[] DEFAULT '{}' NOT NULL,
	"model_name" text,
	"model_version" text,
	"prompt_version" text,
	"question_snapshot" jsonb,
	"feedback_student" text,
	"is_final" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "question_items" ADD CONSTRAINT "question_items_parent_id_question_items_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."question_items"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "paper_question_items" ADD CONSTRAINT "paper_question_items_paper_id_papers_id_fk" FOREIGN KEY ("paper_id") REFERENCES "public"."papers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "paper_question_items" ADD CONSTRAINT "paper_question_items_question_item_id_question_items_id_fk" FOREIGN KEY ("question_item_id") REFERENCES "public"."question_items"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "answers" ADD CONSTRAINT "answers_question_item_id_question_items_id_fk" FOREIGN KEY ("question_item_id") REFERENCES "public"."question_items"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "answers" ADD CONSTRAINT "answers_paper_id_papers_id_fk" FOREIGN KEY ("paper_id") REFERENCES "public"."papers"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "answer_artifact_links" ADD CONSTRAINT "answer_artifact_links_answer_id_answers_id_fk" FOREIGN KEY ("answer_id") REFERENCES "public"."answers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "answer_artifact_links" ADD CONSTRAINT "answer_artifact_links_artifact_id_answer_artifacts_id_fk" FOREIGN KEY ("artifact_id") REFERENCES "public"."answer_artifacts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_answer_id_answers_id_fk" FOREIGN KEY ("answer_id") REFERENCES "public"."answers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "paper_question_items_paper_id_position_idx" ON "paper_question_items" USING btree ("paper_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "answer_artifact_links_answer_id_position_idx" ON "answer_artifact_links" USING btree ("answer_id","position");