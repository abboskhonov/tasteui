CREATE TABLE "cli_install" (
	"id" text PRIMARY KEY NOT NULL,
	"install_id" text NOT NULL,
	"version" text,
	"platform_hash" text,
	"ip_hash" text,
	"installed_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "cli_install_install_id_unique" UNIQUE("install_id")
);
--> statement-breakpoint
CREATE INDEX "cliInstall_installId_idx" ON "cli_install" USING btree ("install_id");--> statement-breakpoint
CREATE INDEX "cliInstall_installedAt_idx" ON "cli_install" USING btree ("installed_at");