"use server";

import { getProductPageData, getProducts, getProductVariant } from "@/src/queries/product";

export const getProductBySlug = getProductPageData;
export { getProductVariant };

export async function getRelatedProducts(categoryUrl: string) {
  return getProducts({ category: categoryUrl }, "", 1, 12);
}
