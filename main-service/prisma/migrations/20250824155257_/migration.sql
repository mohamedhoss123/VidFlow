/*
  Warnings:

  - The `quality` column on the `VideoQuality` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."VideoQuality" DROP COLUMN "quality",
ADD COLUMN     "quality" TEXT;
