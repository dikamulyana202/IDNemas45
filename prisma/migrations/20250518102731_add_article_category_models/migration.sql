/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Category` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `publishedAt` to the `Article` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sourceUrl` to the `Article` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_userId_fkey";

-- AlterTable
ALTER TABLE "Article" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "author" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "publishedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "sourceUrl" TEXT NOT NULL,
ALTER COLUMN "content" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
DROP COLUMN "userId";

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");
