/*
  Warnings:

  - The values [CREATED,PAID] on the enum `OrderStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `isOpen` on the `Table` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[restaurantId,categoryId,name]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[restaurantId,diningAreaId,name]` on the table `Table` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[restaurantId,email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[restaurantId,pin]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `categoryId` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `restaurantId` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `diningAreaId` to the `Table` table without a default value. This is not possible if the table is not empty.
  - Added the required column `restaurantId` to the `Table` table without a default value. This is not possible if the table is not empty.
  - Added the required column `restaurantId` to the `User` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `role` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('OWNER', 'ADMIN', 'CASHIER', 'WAITER', 'KITCHEN');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CARD', 'TRANSFER', 'MIXED');

-- AlterEnum
BEGIN;
CREATE TYPE "OrderStatus_new" AS ENUM ('OPEN', 'SENT_TO_KITCHEN', 'IN_PROGRESS', 'READY', 'SERVED', 'CANCELED', 'CLOSED');
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "public"."OrderStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "categoryId" INTEGER NOT NULL,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "restaurantId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Table" DROP COLUMN "isOpen",
ADD COLUMN     "diningAreaId" INTEGER NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "restaurantId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "email" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "pin" TEXT,
ADD COLUMN     "restaurantId" INTEGER NOT NULL,
DROP COLUMN "role",
ADD COLUMN     "role" "UserRole" NOT NULL;

-- CreateTable
CREATE TABLE "Client" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Restaurant" (
    "id" SERIAL NOT NULL,
    "clientId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Restaurant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiningArea" (
    "id" SERIAL NOT NULL,
    "restaurantId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "DiningArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "restaurantId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "restaurantId" INTEGER NOT NULL,
    "tableId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'OPEN',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "qty" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shift" (
    "id" SERIAL NOT NULL,
    "restaurantId" INTEGER NOT NULL,
    "openedById" INTEGER NOT NULL,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "closedAt" TIMESTAMP(3),
    "closedById" INTEGER,
    "openingCash" DECIMAL(10,2),
    "closingCash" DECIMAL(10,2),
    "notes" TEXT,

    CONSTRAINT "Shift_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" SERIAL NOT NULL,
    "restaurantId" INTEGER NOT NULL,
    "shiftId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "tableId" INTEGER,
    "customerName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "tax" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(10,2) NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'CASH',
    "orderId" INTEGER,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceItem" (
    "id" SERIAL NOT NULL,
    "invoiceId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "qty" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "lineTotal" DECIMAL(10,2) NOT NULL,
    "notes" TEXT,

    CONSTRAINT "InvoiceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceVoid" (
    "id" SERIAL NOT NULL,
    "invoiceId" INTEGER NOT NULL,
    "voidedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "voidedById" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "authorizedById" INTEGER NOT NULL,

    CONSTRAINT "InvoiceVoid_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Client_email_key" ON "Client"("email");

-- CreateIndex
CREATE INDEX "Restaurant_clientId_idx" ON "Restaurant"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "Restaurant_clientId_name_key" ON "Restaurant"("clientId", "name");

-- CreateIndex
CREATE INDEX "DiningArea_restaurantId_idx" ON "DiningArea"("restaurantId");

-- CreateIndex
CREATE UNIQUE INDEX "DiningArea_restaurantId_name_key" ON "DiningArea"("restaurantId", "name");

-- CreateIndex
CREATE INDEX "Category_restaurantId_idx" ON "Category"("restaurantId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_restaurantId_name_key" ON "Category"("restaurantId", "name");

-- CreateIndex
CREATE INDEX "Order_restaurantId_createdAt_idx" ON "Order"("restaurantId", "createdAt");

-- CreateIndex
CREATE INDEX "Order_restaurantId_tableId_idx" ON "Order"("restaurantId", "tableId");

-- CreateIndex
CREATE INDEX "Order_restaurantId_userId_idx" ON "Order"("restaurantId", "userId");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");

-- CreateIndex
CREATE INDEX "Shift_restaurantId_isOpen_idx" ON "Shift"("restaurantId", "isOpen");

-- CreateIndex
CREATE INDEX "Shift_restaurantId_openedAt_idx" ON "Shift"("restaurantId", "openedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_orderId_key" ON "Invoice"("orderId");

-- CreateIndex
CREATE INDEX "Invoice_restaurantId_createdAt_idx" ON "Invoice"("restaurantId", "createdAt");

-- CreateIndex
CREATE INDEX "Invoice_restaurantId_userId_createdAt_idx" ON "Invoice"("restaurantId", "userId", "createdAt");

-- CreateIndex
CREATE INDEX "Invoice_restaurantId_shiftId_idx" ON "Invoice"("restaurantId", "shiftId");

-- CreateIndex
CREATE INDEX "InvoiceItem_invoiceId_idx" ON "InvoiceItem"("invoiceId");

-- CreateIndex
CREATE INDEX "InvoiceItem_productId_idx" ON "InvoiceItem"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "InvoiceVoid_invoiceId_key" ON "InvoiceVoid"("invoiceId");

-- CreateIndex
CREATE INDEX "InvoiceVoid_voidedAt_idx" ON "InvoiceVoid"("voidedAt");

-- CreateIndex
CREATE INDEX "InvoiceVoid_voidedById_idx" ON "InvoiceVoid"("voidedById");

-- CreateIndex
CREATE INDEX "InvoiceVoid_authorizedById_idx" ON "InvoiceVoid"("authorizedById");

-- CreateIndex
CREATE INDEX "Product_restaurantId_idx" ON "Product"("restaurantId");

-- CreateIndex
CREATE INDEX "Product_restaurantId_categoryId_idx" ON "Product"("restaurantId", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_restaurantId_categoryId_name_key" ON "Product"("restaurantId", "categoryId", "name");

-- CreateIndex
CREATE INDEX "Table_restaurantId_idx" ON "Table"("restaurantId");

-- CreateIndex
CREATE INDEX "Table_restaurantId_diningAreaId_idx" ON "Table"("restaurantId", "diningAreaId");

-- CreateIndex
CREATE UNIQUE INDEX "Table_restaurantId_diningAreaId_name_key" ON "Table"("restaurantId", "diningAreaId", "name");

-- CreateIndex
CREATE INDEX "User_restaurantId_idx" ON "User"("restaurantId");

-- CreateIndex
CREATE UNIQUE INDEX "User_restaurantId_email_key" ON "User"("restaurantId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "User_restaurantId_pin_key" ON "User"("restaurantId", "pin");

-- AddForeignKey
ALTER TABLE "Restaurant" ADD CONSTRAINT "Restaurant_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiningArea" ADD CONSTRAINT "DiningArea_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Table" ADD CONSTRAINT "Table_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Table" ADD CONSTRAINT "Table_diningAreaId_fkey" FOREIGN KEY ("diningAreaId") REFERENCES "DiningArea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shift" ADD CONSTRAINT "Shift_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shift" ADD CONSTRAINT "Shift_openedById_fkey" FOREIGN KEY ("openedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shift" ADD CONSTRAINT "Shift_closedById_fkey" FOREIGN KEY ("closedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "Shift"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceVoid" ADD CONSTRAINT "InvoiceVoid_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceVoid" ADD CONSTRAINT "InvoiceVoid_voidedById_fkey" FOREIGN KEY ("voidedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceVoid" ADD CONSTRAINT "InvoiceVoid_authorizedById_fkey" FOREIGN KEY ("authorizedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
