/*
  Warnings:

  - You are about to drop the `Order` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrderProduct` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_customer_id_fkey";

-- DropForeignKey
ALTER TABLE "OrderProduct" DROP CONSTRAINT "OrderProduct_order_id_fkey";

-- DropForeignKey
ALTER TABLE "OrderProduct" DROP CONSTRAINT "OrderProduct_product_id_fkey";

-- DropTable
DROP TABLE "Order";

-- DropTable
DROP TABLE "OrderProduct";
