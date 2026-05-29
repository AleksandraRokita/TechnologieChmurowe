/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "image" TEXT,
ALTER COLUMN "stock" SET DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "Product_name_key" ON "Product"("name");
