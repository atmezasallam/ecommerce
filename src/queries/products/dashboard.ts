"use server";

import { getAllStoreProducts, getProductMainInfo, getProducts } from "@/src/queries/product";

export async function getAllProductsForAdmin() {
  return getProducts({}, "", 1, 100);
}

export const getSellerProducts = getAllStoreProducts;
export const getProductForEdit = getProductMainInfo;
