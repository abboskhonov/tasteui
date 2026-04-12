CREATE TABLE "design_install" (
	"id" text PRIMARY KEY NOT NULL,
	"design_id" text NOT NULL,
	"installed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "design_install" ADD CONSTRAINT "design_install_design_id_design_id_fk" FOREIGN KEY ("design_id") REFERENCES "public"."design"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "designInstall_designId_idx" ON "design_install" USING btree ("design_id");--> statement-breakpoint
CREATE INDEX "designInstall_installedAt_idx" ON "design_install" USING btree ("installed_at");