/*
  Warnings:

  - The values [public,private,unlisted] on the enum `VideoVisibility` will be removed. If these variants are still used in the database, this will fail.
  - Made the column `created_at` on table `Comments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `Likes` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `Notification` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `Subscription` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `Video` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `VideoQuality` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."VideoVisibility_new" AS ENUM ('PUBLIC', 'PRIVATE', 'UNLISTED');
ALTER TABLE "public"."Video" ALTER COLUMN "visibility" TYPE "public"."VideoVisibility_new" USING ("visibility"::text::"public"."VideoVisibility_new");
ALTER TYPE "public"."VideoVisibility" RENAME TO "VideoVisibility_old";
ALTER TYPE "public"."VideoVisibility_new" RENAME TO "VideoVisibility";
DROP TYPE "public"."VideoVisibility_old";
COMMIT;

-- AlterTable
ALTER TABLE "public"."Comments" ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."Likes" ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."Notification" ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."RefreshTokens" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."Subscription" ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."Users" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."Video" ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."VideoQuality" ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- DropEnum
DROP TYPE "public"."VideoQualityOptions";
