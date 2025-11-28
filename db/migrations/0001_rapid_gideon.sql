ALTER TABLE "question_items" ALTER COLUMN "question_text" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "question_items" ADD COLUMN "content_doc" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "question_items" ADD COLUMN "content_html" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "question_items" ADD COLUMN "content_plain" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "question_items" ADD COLUMN "content_version" varchar(32) DEFAULT 'tiptap_v1' NOT NULL;