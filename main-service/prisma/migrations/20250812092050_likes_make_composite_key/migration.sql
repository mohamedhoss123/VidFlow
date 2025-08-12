/*
  Warnings:

  - The primary key for the `Likes` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Likes` table. All the data in the column will be lost.
  - Made the column `user_id` on table `Likes` required. This step will fail if there are existing NULL values in that column.
  - Made the column `video_id` on table `Likes` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."Likes" DROP CONSTRAINT "Likes_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Likes" DROP CONSTRAINT "Likes_video_id_fkey";

-- DropIndex
DROP INDEX "public"."Likes_id_key";

-- AlterTable
ALTER TABLE "public"."Likes" DROP CONSTRAINT "Likes_pkey",
DROP COLUMN "id",
ALTER COLUMN "user_id" SET NOT NULL,
ALTER COLUMN "video_id" SET NOT NULL,
ADD CONSTRAINT "Likes_pkey" PRIMARY KEY ("user_id", "video_id");

-- AddForeignKey
ALTER TABLE "public"."Likes" ADD CONSTRAINT "Likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Likes" ADD CONSTRAINT "Likes_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "public"."Video"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
