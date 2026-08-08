"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { db } from "@/src/lib/db";
import { isPlatformAdmin } from "@/src/lib/admin-access";
import { deleteCategory } from "@/src/queries/category";
import { deleteSubCategory } from "@/src/queries/subCategory";

async function requirePlatformAdmin() {
  const { userId } = await auth();
  if (!userId) {
    console.error("[authz] admin category delete: unauthenticated");
    throw new Error("Unauthenticated.");
  }

  const dbUser = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  const clerkUser = await currentUser();

  if (!isPlatformAdmin(dbUser?.role, clerkUser?.privateMetadata?.role)) {
    console.error("[authz] admin category delete denied", { userId });
    throw new Error("Unauthorized: platform admin required.");
  }

  return userId;
}

export async function adminDeleteCategory(
  categoryId: string
): Promise<{ success: boolean; message: string }> {
  const userId = await requirePlatformAdmin();
  if (!categoryId) {
    throw new Error("Missing category id.");
  }

  try {
    await deleteCategory(categoryId);
    revalidatePath("/dashboard/admin/categories");
    return { success: true, message: "Category deleted." };
  } catch (error) {
    console.error("[authz] adminDeleteCategory failed", { userId, categoryId, error });
    throw error;
  }
}

export async function adminDeleteSubCategory(
  subCategoryId: string
): Promise<{ success: boolean; message: string }> {
  const userId = await requirePlatformAdmin();
  if (!subCategoryId) {
    throw new Error("Missing sub-category id.");
  }

  try {
    await deleteSubCategory(subCategoryId);
    revalidatePath("/dashboard/admin/subCategories");
    return { success: true, message: "Sub-category deleted." };
  } catch (error) {
    console.error("[authz] adminDeleteSubCategory failed", {
      userId,
      subCategoryId,
      error,
    });
    throw error;
  }
}
