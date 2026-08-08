-- AlterTable
ALTER TABLE `Order` MODIFY `status` ENUM('PENDING_PAYMENT', 'PAYMENT_FAILED', 'PROCESSING', 'SHIPPED', 'PARTIALLY_SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED') NOT NULL DEFAULT 'PENDING_PAYMENT';

-- CreateEnum (MySQL: used via column type)
-- CreateTable alterations for OrderItem
ALTER TABLE `OrderItem`
  ADD COLUMN `fulfillmentStatus` ENUM('PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED') NOT NULL DEFAULT 'PROCESSING',
  ADD COLUMN `fulfillmentUpdatedAt` DATETIME(3) NULL,
  ADD COLUMN `trackingNumber` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `OrderItem_storeId_fulfillmentStatus_idx` ON `OrderItem`(`storeId`, `fulfillmentStatus`);
