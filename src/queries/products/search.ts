"use server";

import { getProducts } from "@/src/queries/product";
import { getProductsByCategory as getHomepageProductsByCategory } from "@/src/queries/products/homepage";

export const searchProducts = getProducts;
export const filterProducts = getProducts;

export async function getProductsByCategory(categoryId: string) {
  return getHomepageProductsByCategory(categoryId);
}
