CREATE TABLE "critiques" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creative_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"body" text NOT NULL,
	"rating" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reading_list" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"creative_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "reading_list_user_creative_unique" UNIQUE("user_id","creative_id")
);
--> statement-breakpoint
ALTER TABLE "chapters" ADD COLUMN "published" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "creatives" ADD COLUMN "genre" text;--> statement-breakpoint
ALTER TABLE "creatives" ADD COLUMN "published" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "creatives" ADD COLUMN "total_chapters" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "creatives" ADD COLUMN "total_critiques" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "creatives" ADD COLUMN "total_count_of_reading_list_adds" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "slug" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "total_creatives" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "critiques" ADD CONSTRAINT "critiques_creative_id_creatives_id_fk" FOREIGN KEY ("creative_id") REFERENCES "public"."creatives"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "critiques" ADD CONSTRAINT "critiques_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reading_list" ADD CONSTRAINT "reading_list_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reading_list" ADD CONSTRAINT "reading_list_creative_id_creatives_id_fk" FOREIGN KEY ("creative_id") REFERENCES "public"."creatives"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "critiques_creative_id_idx" ON "critiques" USING btree ("creative_id");--> statement-breakpoint
CREATE INDEX "critiques_user_id_idx" ON "critiques" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "reading_list_user_id_idx" ON "reading_list" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "reading_list_creative_id_idx" ON "reading_list" USING btree ("creative_id");--> statement-breakpoint
CREATE INDEX "creatives_published_idx" ON "creatives" USING btree ("published");--> statement-breakpoint
CREATE INDEX "users_slug_idx" ON "users" USING btree ("slug");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_slug_unique" UNIQUE("slug");