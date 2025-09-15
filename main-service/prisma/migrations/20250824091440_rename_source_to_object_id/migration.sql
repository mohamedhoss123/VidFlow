/*
  Warnings:

  - You are about to drop the column `source` on the `VideoQuality` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."VideoQuality" DROP COLUMN "source",
ADD COLUMN     "objectId" VARCHAR(255);
