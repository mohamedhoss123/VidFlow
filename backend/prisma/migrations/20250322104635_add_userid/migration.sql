/*
  Warnings:

  - Added the required column `userId` to the `Video` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Video` DROP FOREIGN KEY `Video_id_fkey`;

-- AlterTable
ALTER TABLE `Video` ADD COLUMN `userId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Video` ADD CONSTRAINT `Video_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
