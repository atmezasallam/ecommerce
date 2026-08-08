-- CreateIndex
CREATE INDEX `Order_status_idx` ON `Order`(`status`);

-- CreateIndex
CREATE INDEX `Order_paymentStatus_idx` ON `Order`(`paymentStatus`);

-- CreateIndex
CREATE INDEX `Order_createdAt_idx` ON `Order`(`createdAt`);

-- CreateIndex
CREATE INDEX `Order_userId_createdAt_idx` ON `Order`(`userId`, `createdAt`);

-- CreateIndex
CREATE INDEX `Store_status_idx` ON `Store`(`status`);

-- CreateIndex
CREATE INDEX `Store_featured_idx` ON `Store`(`featured`);

-- CreateIndex
CREATE INDEX `Product_isArchived_idx` ON `Product`(`isArchived`);

-- CreateIndex
CREATE INDEX `Product_storeId_isArchived_idx` ON `Product`(`storeId`, `isArchived`);

-- CreateIndex
CREATE INDEX `Product_categoryId_isArchived_idx` ON `Product`(`categoryId`, `isArchived`);

-- CreateIndex
CREATE INDEX `ShippingRate_storeId_countryId_idx` ON `ShippingRate`(`storeId`, `countryId`);

-- RenameIndex
-- MySQL already indexed CartItem.storeId for the FK; Prisma claims it as the explicit @@index.
ALTER TABLE `cartitem` RENAME INDEX `CartItem_storeId_fkey` TO `CartItem_storeId_idx`;
