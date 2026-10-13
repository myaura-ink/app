CREATE TABLE "chapter_reads" (
	"user_id" uuid NOT NULL,
	"chapter_id" uuid NOT NULL,
	"story_id" uuid NOT NULL,
	"read_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "chapter_reads_user_id_chapter_id_pk" PRIMARY KEY("user_id","chapter_id")
);
--> statement-breakpoint
ALTER TABLE "chapter_reads" ADD CONSTRAINT "chapter_reads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chapter_reads" ADD CONSTRAINT "chapter_reads_chapter_id_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chapter_reads" ADD CONSTRAINT "chapter_reads_story_id_stories_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "chapter_reads_user_id_story_id_idx" ON "chapter_reads" USING btree ("user_id","story_id");--> statement-breakpoint
-- the last-read chapter of each story read before this table existed counts as read
INSERT INTO "chapter_reads" ("user_id", "chapter_id", "story_id", "read_at")
SELECT "user_id", "chapter_id", "story_id", "read_at" FROM "reading_history" WHERE "chapter_id" IS NOT NULL
ON CONFLICT DO NOTHING;
