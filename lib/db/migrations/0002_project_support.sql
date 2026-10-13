CREATE TABLE "project_support" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"liked" boolean DEFAULT false NOT NULL,
	"pledge" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "project_support_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "project_support" ADD CONSTRAINT "project_support_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;