/*
  Warnings:

  - You are about to alter the column `total_value` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `product_price` on the `OrderProduct` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `products_value` on the `OrderProduct` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "total_value" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "OrderProduct" ALTER COLUMN "product_price" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "products_value" SET DATA TYPE DECIMAL(10,2);
