/*
  Warnings:

  - The values [PUBLIC,PRIVATE,UNLISTED] on the enum `VideoVisibility` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."VideoVisibility_new" AS ENUM ('public', 'private', 'unlisted');
ALTER TABLE "public"."Video" ALTER COLUMN "visibility" TYPE "public"."VideoVisibility_new" USING ("visibility"::text::"public"."VideoVisibility_new");
ALTER TYPE "public"."VideoVisibility" RENAME TO "VideoVisibility_old";
ALTER TYPE "public"."VideoVisibility_new" RENAME TO "VideoVisibility";
DROP TYPE "public"."VideoVisibility_old";
COMMIT;

-- AlterTable
ALTER TABLE "public"."Video" ADD COLUMN     "thumbnail_object_id" VARCHAR(255);
