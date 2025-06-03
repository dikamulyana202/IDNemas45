/*
  Warnings:

  - You are about to drop the column `userId` on the `Article` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Article" DROP CONSTRAINT "Article_userId_fkey";

-- AlterTable
ALTER TABLE "Article" DROP COLUMN "userId";
