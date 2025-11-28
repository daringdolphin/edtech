DO $$ BEGIN
 CREATE TYPE "public"."paper_block_type" AS ENUM('question', 'heading', 'text', 'image', 'logo', 'spacer', 'divider');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "paper_blocks" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"paper_id" bigint NOT NULL,
	"block_type" "paper_block_type" NOT NULL,
	"position" integer NOT NULL,
	"question_item_id" bigint,
	"block_doc" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"block_html" text DEFAULT '' NOT NULL,
	"block_plain" text DEFAULT '' NOT NULL,
	"block_version" varchar(32) DEFAULT 'tiptap_v1' NOT NULL,
	"overrides" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"meta" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "paper_question_items";--> statement-breakpoint
ALTER TABLE "papers" ADD COLUMN "content_doc" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "papers" ADD COLUMN "content_html" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "papers" ADD COLUMN "content_plain" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "papers" ADD COLUMN "content_version" varchar(32) DEFAULT 'tiptap_v1' NOT NULL;--> statement-breakpoint
ALTER TABLE "papers" ADD COLUMN "header_doc" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "papers" ADD COLUMN "footer_doc" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "papers" ADD COLUMN "branding" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "papers" ADD COLUMN "page_settings" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "paper_blocks" ADD CONSTRAINT "paper_blocks_paper_id_papers_id_fk" FOREIGN KEY ("paper_id") REFERENCES "public"."papers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "paper_blocks" ADD CONSTRAINT "paper_blocks_question_item_id_question_items_id_fk" FOREIGN KEY ("question_item_id") REFERENCES "public"."question_items"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "paper_blocks_paper_id_position_idx" ON "paper_blocks" USING btree ("paper_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "paper_blocks_paper_id_question_item_id_idx" ON "paper_blocks" USING btree ("paper_id","question_item_id");