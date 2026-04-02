ALTER TABLE "design" ADD COLUMN "slug" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "username" text;--> statement-breakpoint
CREATE INDEX "design_slug_idx" ON "design" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "design_userId_slug_idx" ON "design" USING btree ("user_id","slug");--> statement-breakpoint
CREATE INDEX "user_username_idx" ON "user" USING btree ("username");--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_username_unique" UNIQUE("username");