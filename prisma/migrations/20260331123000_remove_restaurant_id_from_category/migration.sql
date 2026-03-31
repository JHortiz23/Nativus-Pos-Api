-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_restaurantId_fkey";

-- DropIndex
DROP INDEX "Category_restaurantId_idx";

-- DropIndex
DROP INDEX "Category_restaurantId_name_key";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "restaurantId";
