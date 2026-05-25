
"use server";

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/src/lib/db";

import { Category, SubCategory } from "@prisma/client";



export type UpsertSubCategoryInput = {
  id: string;
  name?: string | null;
  image?: string | null;
  url?: string | null;
  featured?: boolean | null;
  categoryId: string;
};

// upsertSubCategory
export const upsertSubCategory = async (data: UpsertSubCategoryInput) => {
  try {
    const user = await currentUser();
    if (!user) throw new Error("Unauthenticated.");
    if (user.privateMetadata.role !== "ADMIN") {
      throw new Error("Unauthorized Access: Admin Privileges Required.");
    }

    const safeData = {
      id: data.id,
      name: data.name ?? "",
      image: data.image ?? "",
      url: data.url ?? "",
      featured: !!data.featured,
      categoryId: data.categoryId,
    };

    console.log("SERVER RECEIVED SubCategory:", safeData);

    const existing = await db.subCategory.findFirst({
      where: {
        AND: [
          { OR: [{ name: safeData.name }, { url: safeData.url }] },
          { NOT: { id: safeData.id } },
        ],
      },
    });

    if (existing) {
      if (existing.name === safeData.name) {
        throw new Error("A sub-category with this name already exists.");
      }
      if (existing.url === safeData.url) {
        throw new Error("A sub-category with this URL already exists.");
      }
    }

    const subCategoryDetails = await db.subCategory.upsert({
      where: { id: safeData.id },
      update: {
        name: safeData.name,
        image: safeData.image,
        url: safeData.url,
        featured: safeData.featured,
        categoryId: safeData.categoryId,
      },
      create: {
        id: safeData.id,
        name: safeData.name,
        image: safeData.image,
        url: safeData.url,
        featured: safeData.featured,
        categoryId: safeData.categoryId,
      },
    });

    return subCategoryDetails;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export default upsertSubCategory;

// getAllSubCategories
export const getAllSubCategories = async () => {
  const subCategories = await db.subCategory.findMany({
    include: {
      category: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
  return subCategories;
};

// getSubCategory not cateories
export const getSubCategory = async (subCategoryId: string) => {
  if (!subCategoryId) throw new Error("Please provide sub-category ID.");

  const subCategory = await db.subCategory.findUnique({
    where: {
      id: subCategoryId,
    },
  });
  return subCategory;
};

// deleteSubCategory
export const deleteSubCategory = async (subCategoryId: string) => {
  const user = await currentUser();

  if (!user) throw new Error("Unauthenticated.");

  if (user.privateMetadata.role !== "ADMIN") {
    throw new Error(
      "Unauthorized Access: Admin Privileges Required for Entry."
    );
  }

  if (!subCategoryId) throw new Error("Please provide sub-category ID.");

  const response = await db.subCategory.delete({
    where: {
      id: subCategoryId,
    },
  });

  return response;
};


// Function: getSubcategories
// Description: Retrieves subcategories from the database, with options for limiting results and random selection.
// Parameters:
//   - limit: Number indicating the maximum number of subcategories to retrieve.
//   - random: Boolean indicating whether to return random subcategories.
// Returns: List of subcategories based on the provided options.
export const getSubcategories = async (
  limit: number | null,
  random: boolean = false
): Promise<SubCategory[]> => {
  // Define SortOrder enum
  enum SortOrder {
    asc = "asc",
    desc = "desc",
  }
  try {
    // Define the query options
    const queryOptions = {
      take: limit || undefined, // Use the provided limit or undefined for no limit
      orderBy: random ? { createdAt: SortOrder.desc } : undefined, // Use SortOrder for ordering
    };

    // If random selection is required, use a raw query to randomize
    if (random) {
      const subcategories = await db.$queryRaw<SubCategory[]>`
    SELECT * FROM SubCategory
    ORDER BY RAND()
    LIMIT ${limit || 10} 
    `;
      return subcategories;
    } else {
      // Otherwise, fetch subcategories based on the defined query options
      const subcategories = await db.subCategory.findMany(queryOptions);
      return subcategories;
    }
  } catch (error) {
    // Log and re-throw any errors
    console.error("Error fetching subcategories:", error);
    throw error;
  }
};
