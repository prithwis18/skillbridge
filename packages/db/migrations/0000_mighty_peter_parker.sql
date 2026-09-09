CREATE TABLE "resource_skills" (
	"resource_id" uuid NOT NULL,
	"skill_id" uuid NOT NULL,
	"weight" real DEFAULT 1 NOT NULL,
	CONSTRAINT "resource_skills_resource_id_skill_id_pk" PRIMARY KEY("resource_id","skill_id")
);
--> statement-breakpoint
CREATE TABLE "resources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" text DEFAULT 'course' NOT NULL,
	"source" text NOT NULL,
	"external_id" text NOT NULL,
	"title" text NOT NULL,
	"url" text NOT NULL,
	"provider" text NOT NULL,
	"level" text DEFAULT 'beginner' NOT NULL,
	"duration_mins" integer,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"category" text DEFAULT 'general' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "resource_skills" ADD CONSTRAINT "resource_skills_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_skills" ADD CONSTRAINT "resource_skills_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "resource_skills_skill_idx" ON "resource_skills" USING btree ("skill_id");--> statement-breakpoint
CREATE UNIQUE INDEX "resources_source_external_uniq" ON "resources" USING btree ("source","external_id");--> statement-breakpoint
CREATE INDEX "resources_kind_idx" ON "resources" USING btree ("kind");--> statement-breakpoint
CREATE UNIQUE INDEX "skills_slug_uniq" ON "skills" USING btree ("slug");