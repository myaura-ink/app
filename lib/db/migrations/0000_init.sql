CREATE TYPE "public"."user_role" AS ENUM('admin', 'super_admin', 'user', 'writer');--> statement-breakpoint
CREATE TABLE "chapters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"story_id" uuid NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"content" text,
	"order" integer NOT NULL,
	"published" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "critiques" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"story_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"body" text NOT NULL,
	"rating" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "library" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"story_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "library_user_story_unique" UNIQUE("user_id","story_id")
);
--> statement-breakpoint
CREATE TABLE "stories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"cover_image" text,
	"genre" text,
	"published" integer DEFAULT 0 NOT NULL,
	"author_id" uuid NOT NULL,
	"total_chapters" integer DEFAULT 0 NOT NULL,
	"total_critiques" integer DEFAULT 0 NOT NULL,
	"total_count_of_library_adds" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "stories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "story_tags" (
	"story_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "story_tags_story_id_tag_id_pk" PRIMARY KEY("story_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "tags_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"name" text,
	"slug" text NOT NULL,
	"image" text,
	"roles" "user_role"[] DEFAULT '{"user","writer"}' NOT NULL,
	"last_signed_in_at" timestamp DEFAULT now(),
	"total_stories" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_story_id_stories_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "critiques" ADD CONSTRAINT "critiques_story_id_stories_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "critiques" ADD CONSTRAINT "critiques_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "library" ADD CONSTRAINT "library_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "library" ADD CONSTRAINT "library_story_id_stories_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stories" ADD CONSTRAINT "stories_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "story_tags" ADD CONSTRAINT "story_tags_story_id_stories_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "story_tags" ADD CONSTRAINT "story_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "chapters_story_id_idx" ON "chapters" USING btree ("story_id");--> statement-breakpoint
CREATE INDEX "chapters_story_id_order_idx" ON "chapters" USING btree ("story_id","order");--> statement-breakpoint
CREATE INDEX "critiques_story_id_idx" ON "critiques" USING btree ("story_id");--> statement-breakpoint
CREATE INDEX "critiques_user_id_idx" ON "critiques" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "library_user_id_idx" ON "library" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "library_story_id_idx" ON "library" USING btree ("story_id");--> statement-breakpoint
CREATE INDEX "stories_author_id_idx" ON "stories" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "stories_slug_idx" ON "stories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "stories_published_idx" ON "stories" USING btree ("published");--> statement-breakpoint
CREATE INDEX "story_tags_tag_id_idx" ON "story_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_slug_idx" ON "users" USING btree ("slug");--> statement-breakpoint
-- denormalized counters (users.total_stories, stories.total_*), kept up to date by triggers
CREATE OR REPLACE FUNCTION update_total_stories() RETURNS trigger AS $$
BEGIN
  IF (TG_OP = 'UPDATE') AND new.published = 1 AND old.published = 0 THEN
    UPDATE users SET total_stories = total_stories + 1 WHERE id = new.author_id;
  ELSIF (TG_OP = 'UPDATE') AND new.published = 0 AND old.published = 1 THEN
    UPDATE users SET total_stories = total_stories - 1 WHERE id = new.author_id;
  ELSIF (TG_OP = 'DELETE') AND old.published = 1 THEN
    UPDATE users SET total_stories = total_stories - 1 WHERE id = old.author_id;
  ELSIF (TG_OP = 'INSERT') AND new.published = 1 THEN
    UPDATE users SET total_stories = total_stories + 1 WHERE id = new.author_id;
  END IF;
  RETURN null;
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint
CREATE OR REPLACE TRIGGER "_002_update_total_stories"
AFTER INSERT OR UPDATE OR DELETE ON "stories"
FOR EACH ROW EXECUTE FUNCTION update_total_stories();--> statement-breakpoint
CREATE OR REPLACE FUNCTION update_total_chapters() RETURNS trigger AS $$
BEGIN
  IF (TG_OP = 'UPDATE') AND new.published = 1 AND old.published = 0 THEN
    UPDATE stories SET total_chapters = total_chapters + 1 WHERE id = new.story_id;
  ELSIF (TG_OP = 'UPDATE') AND new.published = 0 AND old.published = 1 THEN
    UPDATE stories SET total_chapters = total_chapters - 1 WHERE id = new.story_id;
  ELSIF (TG_OP = 'DELETE') AND old.published = 1 THEN
    UPDATE stories SET total_chapters = total_chapters - 1 WHERE id = old.story_id;
  ELSIF (TG_OP = 'INSERT') AND new.published = 1 THEN
    UPDATE stories SET total_chapters = total_chapters + 1 WHERE id = new.story_id;
  END IF;
  RETURN null;
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint
CREATE OR REPLACE TRIGGER "_002_update_total_chapters"
AFTER INSERT OR UPDATE OR DELETE ON "chapters"
FOR EACH ROW EXECUTE FUNCTION update_total_chapters();--> statement-breakpoint
CREATE OR REPLACE FUNCTION update_total_critiques() RETURNS trigger AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    UPDATE stories SET total_critiques = total_critiques - 1 WHERE id = old.story_id;
  ELSIF (TG_OP = 'INSERT') THEN
    UPDATE stories SET total_critiques = total_critiques + 1 WHERE id = new.story_id;
  END IF;
  RETURN null;
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint
CREATE OR REPLACE TRIGGER "_002_update_total_critiques"
AFTER INSERT OR DELETE ON "critiques"
FOR EACH ROW EXECUTE FUNCTION update_total_critiques();--> statement-breakpoint
CREATE OR REPLACE FUNCTION update_total_library_adds() RETURNS trigger AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    UPDATE stories SET total_count_of_library_adds = total_count_of_library_adds - 1 WHERE id = old.story_id;
  ELSIF (TG_OP = 'INSERT') THEN
    UPDATE stories SET total_count_of_library_adds = total_count_of_library_adds + 1 WHERE id = new.story_id;
  END IF;
  RETURN null;
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint
CREATE OR REPLACE TRIGGER "_002_update_total_library_adds"
AFTER INSERT OR DELETE ON "library"
FOR EACH ROW EXECUTE FUNCTION update_total_library_adds();
