/*
  Warnings:

  - You are about to drop the `_PortfolioItemToTag` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_PortfolioItemToTag" DROP CONSTRAINT "_PortfolioItemToTag_A_fkey";

-- DropForeignKey
ALTER TABLE "_PortfolioItemToTag" DROP CONSTRAINT "_PortfolioItemToTag_B_fkey";

-- AlterTable
ALTER TABLE "PortfolioItem" ADD COLUMN     "tags" TEXT[];

-- DropTable
DROP TABLE "_PortfolioItemToTag";
