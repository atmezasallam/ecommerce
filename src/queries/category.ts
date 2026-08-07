"use server";

import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";

import { db } from "@/src/lib/db";

const CATEGORIES_CACHE_TAG = "categories";


type UpsertCategoryInput = {
  id: string;
  name?: string | null;
  image?: string | null;
  url?: string | null;
  featured?: boolean | null;
};



















export const upsertCategory = async (category: UpsertCategoryInput) => {
  try {
    const user = await currentUser();
    if (!user) throw new Error("Unauthenticated.");
    if (user.privateMetadata.role !== "ADMIN")
      throw new Error("Unauthorized Access: Admin Privileges Required.");

    const safeData = {
      id: category.id,
      name: (category.name ?? "").trim(),
      image: category.image ?? "",
      url: (category.url ?? "").trim(),
      featured: !!category.featured,
    };

    console.log("SERVER RECEIVED CATEGORY:", safeData);

    const existing = await db.category.findFirst({
      where: {
        AND: [
          { OR: [{ name: safeData.name }, { url: safeData.url }] },
          { NOT: { id: safeData.id } },
        ],
      },
    });

    if (existing) {
      if (existing.name === safeData.name)
        throw new Error("A category with this name already exists.");
      if (existing.url === safeData.url)
        throw new Error("A category with this URL already exists.");
    }

    const categoryDetails = await db.category.upsert({
      where: { id: safeData.id },
      update: {
        name: safeData.name,
        image: safeData.image,
        url: safeData.url,
        featured: safeData.featured,
      },
      create: {
        id: safeData.id,
        name: safeData.name,
        image: safeData.image,
        url: safeData.url,
        featured: safeData.featured,
      },
    });

    revalidateTag(CATEGORIES_CACHE_TAG);
    revalidatePath("/");
    revalidatePath("/browse");
    revalidatePath("/dashboard/admin/categories");

    return categoryDetails;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export default upsertCategory;

// ======================
// getAllCategories
// ======================


// Function: getAllCategories
// Description: Retrieves all categories from the database.
// Permission Level: Public
// Returns: Array of categories sorted by updatedAt date in descending order.


const getAllCategoriesCached = unstable_cache(
  async () =>
    db.category.findMany({
      orderBy: {
        updatedAt: "desc",
      },
    }),
  ["categories-with-subs"],
  { revalidate: 3600, tags: [CATEGORIES_CACHE_TAG] }
);

export const getAllCategories = async () => getAllCategoriesCached();




// Function: getAllCategoriesForCategory
// Description: Retrieves all subcategories for a specific category from the database.
// Permission Level: Public
// Returns: Array of subcategories of category sorted by updatedAt date in descending order.


export const getAllCategoriesForCategory = async (categoryId: string) => {
  // Retrieve all subcategories for a specific category from the database
  // NOTE: SubCategory model stores categoryId
  const subCategories = await db.subCategory.findMany({
    where: {
      categoryId,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return subCategories;
};





// ======================
// getCategory
// ======================






// Function: getCategory
// Description: Retrieves a specific category from the database.
// Access Level: Public
// Parameters:
//   - categoryId: The ID of the category to be retrieved.
// Returns: Details of the requested category.


export const getCategory = async (categoryId: string) => {
  if (!categoryId) throw new Error("Please provide category ID.");

  const category = await db.category.findUnique({
    where: {
      id: categoryId,
    },
  });
  return category;
};

// ======================
// deleteCategory
// ======================






export const deleteCategory = async (categoryId: string) => {
  const user = await currentUser();

  if (!user) throw new Error("Unauthenticated.");

  if (user.privateMetadata.role !== "ADMIN")
    throw new Error(
      "Unauthorized Access: Admin Privileges Required for Entry."
    );

  if (!categoryId) throw new Error("Please provide category ID.");

  // Use a transaction to delete all related records
  const response = await db.$transaction(async (tx) => {
    // First, get the category with all related data
    const category = await tx.category.findUnique({
      where: { id: categoryId },
      include: {
        subCategory: true,
        products: {
          include: {
            variants: {
              include: {
                sizes: true,
                images: true,
                colors: true,
              },
            },
          },
        },
      },
    });

    if (!category) {
      throw new Error("Category not found.");
    }

    // Delete all products and their related data
    for (const product of category.products) {
      // Delete all related records for each variant
      for (const variant of product.variants) {
        // Delete sizes
        await tx.size.deleteMany({
          where: { productVariantId: variant.id },
        });

        // Delete images
        await tx.productVariantImage.deleteMany({
          where: { productVariantId: variant.id },
        });

        // Delete colors
        await tx.color.deleteMany({
          where: { productVariantId: variant.id },
        });
      }

      // Delete all product variants
      await tx.productVariant.deleteMany({
        where: { productId: product.id },
      });

      // Delete product specs and questions
      await tx.spec.deleteMany({
        where: { productId: product.id },
      });

      await tx.question.deleteMany({
        where: { productId: product.id },
      });

      // Delete the product
      await tx.product.delete({
        where: { id: product.id },
      });
    }

    // Delete all subcategories
    // Note: Products are already deleted above, so we don't need to delete them again
    for (const subCategory of category.subCategory) {
      // Delete the subcategory
      await tx.subCategory.delete({
        where: { id: subCategory.id },
      });
    }

    // Finally, delete the category
    return await tx.category.delete({
      where: { id: categoryId },
    });
  });

  revalidateTag(CATEGORIES_CACHE_TAG);
  revalidatePath("/");
  revalidatePath("/browse");
  revalidatePath("/dashboard/admin/categories");

  return response;
};
