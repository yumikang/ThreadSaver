/*
  Warnings:

  - Added the required column `content` to the `episodes` table without a default value. This is not possible if the table is not empty.

*/
-- Step 1: Add column with temporary default
ALTER TABLE "episodes" ADD COLUMN "content" TEXT NOT NULL DEFAULT '';

-- Step 2: Update existing episodes with content from their notes
UPDATE "episodes" e
SET "content" = (
  SELECT string_agg(en.content, E'\n\n' ORDER BY en."order")
  FROM "episode_notes" en
  WHERE en."episodeId" = e.id
)
WHERE EXISTS (
  SELECT 1 FROM "episode_notes" en WHERE en."episodeId" = e.id
);

-- Step 3: Remove default constraint (if needed for future inserts to be explicit)
-- ALTER TABLE "episodes" ALTER COLUMN "content" DROP DEFAULT;
