"use server";

import { getAllCategories } from "@/src/queries/category";

export async function getCategoriesWithSubs() {
  return getAllCategories();
}
