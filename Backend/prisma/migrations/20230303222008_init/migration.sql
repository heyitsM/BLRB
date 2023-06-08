/*
  Warnings:

  - You are about to drop the column `profileId` on the `Portfolio` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Portfolio` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tag_info]` on the table `Tag` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Portfolio` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Portfolio" DROP CONSTRAINT "Portfolio_profileId_fkey";

-- DropIndex
DROP INDEX "Portfolio_profileId_key";

-- AlterTable
ALTER TABLE "Portfolio" DROP COLUMN "profileId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Portfolio_userId_key" ON "Portfolio"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_tag_info_key" ON "Tag"("tag_info");

-- AddForeignKey
ALTER TABLE "Portfolio" ADD CONSTRAINT "Portfolio_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
