/*
  Warnings:

  - You are about to drop the column `discription` on the `Video` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Video` DROP COLUMN `discription`,
    ADD COLUMN `description` VARCHAR(191) NULL;
