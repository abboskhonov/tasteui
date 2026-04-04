-- Add files column to design table for multi-file skills
ALTER TABLE "design" ADD COLUMN IF NOT EXISTS "files" text;
