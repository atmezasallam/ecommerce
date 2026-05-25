
"use server";

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/src/lib/db";
import { StoreDefaultShippingType } from "@/src/lib/types";
import { v4 } from "uuid";

// Prisma models
import { ShippingRate, Store } from "@prisma/client";







export type UpsertStoreInput = {
  id?: string;
  name: string;
  description?: string | null;
  email: string;
  phone: string;
  url: string;
  logo: string;
  cover: string;
  featured?: boolean | null;
};

export const upsertStore = async (data: UpsertStoreInput) => {
  const authUser = await currentUser();

  if (!authUser) {
    throw new Error("Unauthenticated.");
  }

  // 1️⃣ اقرأ الـ email من Clerk
  const clerkEmail =
    authUser.emailAddresses?.[0]?.emailAddress ??
    authUser.primaryEmailAddress?.emailAddress ??
    "";

  // 2️⃣ حاول لاقي user بالـ id
  let dbUser = await db.user.findUnique({
    where: { id: authUser.id },
  });

  // 3️⃣ لو ما لقيناه بالـ id، نجرب نلاقيه بالـ email
  if (!dbUser) {
    dbUser = await db.user.findUnique({
      where: { email: clerkEmail },
    });
  }

  // 4️⃣ لو لسه مش موجود → أنشئه (create)
  if (!dbUser) {
    dbUser = await db.user.create({
      data: {
        id: authUser.id,
        name:
          authUser.firstName || authUser.lastName
            ? `${authUser.firstName || ""} ${authUser.lastName || ""}`.trim()
            : authUser.username || authUser.id,
        email: clerkEmail,
        image_url: authUser.imageUrl,
        role: "SELLER",
      },
    });
  }

  // 5️⃣ update user بدون تغيير الـ email (حتى لا يحدث unique conflict)
  await db.user.update({
    where: { id: dbUser.id },
    data: {
      name:
        authUser.firstName || authUser.lastName
          ? `${authUser.firstName || ""} ${authUser.lastName || ""}`.trim()
          : authUser.username || authUser.id,
      image_url: authUser.imageUrl,
      // ❌ لا نحدث email هنا أبدًا
    },
  });

  // 6️⃣ create / update store
  const store = await db.store.upsert({
    where: {
      id: data.id ?? "",
    },
    update: {
      name: data.name,
      description: data.description ?? "",
      email: data.email,
      phone: data.phone,
      url: data.url,
      logo: data.logo,
      cover: data.cover,
      featured: data.featured ?? false,
    },
    create: {
      ...(data.id ? { id: data.id } : {}),
      name: data.name,
      description: data.description ?? "",
      email: data.email,
      phone: data.phone,
      url: data.url,
      logo: data.logo,
      cover: data.cover,
      featured: data.featured ?? false,
      userId: dbUser.id,
    },
  });

  return store;
};








// Function: getStoreDefaultShippingDetails
// Description: Fetches the default shipping details for a store based on the store URL.
// Parameters:
//   - storeUrl: The URL of the store to fetch default shipping details for.
// Returns: An object containing default shipping details, including shipping service, fees, delivery times, and return policy.
export const getStoreDefaultShippingDetails = async (storeUrl: string) => {
  try {
    // Ensure the store URL is provided
    if (!storeUrl) throw new Error("Store URL is required.");

    // Fetch the store and its default shipping details
    const store = await db.store.findUnique({
      where: {
        url: storeUrl,
      },
      select: {
        defaultShippingService: true,
        defaultShippingFeePerItem: true,
        defaultShippingFeeForAdditionalItem: true,
        defaultShippingFeePerKg: true,
        defaultShippingFeeFixed: true,
        defaultDeliveryTimeMin: true,
        defaultDeliveryTimeMax: true,
        returnPolicy: true,
      },
    });

    // Throw an error if the store is not found
    if (!store) throw new Error("Store not found.");

    return store;
  } catch (error) {
    // Log and re-throw any errors
    console.log(error);
    throw error;
  }
};




// Function: updateStoreDefaultShippingDetails
// Description: Updates the default shipping details for a store based on the store URL.
// Parameters:
//   - storeUrl: The URL of the store to update.
//   - details: An object containing the new shipping details (shipping service, fees, delivery times, and return policy).
// Returns: The updated store object with the new default shipping details.
export const updateStoreDefaultShippingDetails = async (
  storeUrl: string,
  details: StoreDefaultShippingType
) => {
  try {
    // Get current user from Clerk
    const authUser = await currentUser();

    // Ensure user is authenticated
    if (!authUser) throw new Error("Unauthenticated.");

    // Get the email from Clerk
    const clerkEmail =
      authUser.emailAddresses?.[0]?.emailAddress ??
      authUser.primaryEmailAddress?.emailAddress ??
      "";

    // Find the database user (same logic as upsertStore)
    let dbUser = await db.user.findUnique({
      where: { id: authUser.id },
    });

    // If not found by id, try to find by email
    if (!dbUser) {
      dbUser = await db.user.findUnique({
        where: { email: clerkEmail },
      });
    }

    // If still not found, create the user
    if (!dbUser) {
      dbUser = await db.user.create({
        data: {
          id: authUser.id,
          name:
            authUser.firstName || authUser.lastName
              ? `${authUser.firstName || ""} ${authUser.lastName || ""}`.trim()
              : authUser.username || authUser.id,
          email: clerkEmail,
          image_url: authUser.imageUrl,
          role: "SELLER",
        },
      });
    }

    // Ensure the store URL is provided
    if (!storeUrl) throw new Error("Store URL is required.");

    // Ensure at least one detail is provided for update
    if (!details) {
      throw new Error("No shipping details provided to update.");
    }

    // Find the store by URL
    const store = await db.store.findUnique({
      where: {
        url: storeUrl,
      },
    });

    if (!store) throw new Error("Store not found.");

    // Make sure seller is updating their own store
    if (store.userId !== dbUser.id) {
      throw new Error(
        "Make sure you have the permissions to update this store"
      );
    }

    // Update the store
    const updatedStore = await db.store.update({
      where: {
        url: storeUrl,
      },
      data: details,
    });

    return updatedStore;
  } catch (error) {
    // Log and re-throw any errors
    console.log(error);
    throw error;
  }
};






/**
 * Function: getStoreShippingRates
 * Description: Retrieves all countries and their shipping rates for a specific store.
 *              If a country does not have a shipping rate, it is still included in the result with a null shippingRate.
 * Permission Level: Public
 * Returns: Array of objects where each object contains a country and its associated shippingRate, sorted by country name.
 */
export const getStoreShippingRates = async (storeUrl: string) => {
  try {
    // Get current user from Clerk
    const authUser = await currentUser();

    // Ensure user is authenticated
    if (!authUser) throw new Error("Unauthenticated.");

    // Get the email from Clerk
    const clerkEmail =
      authUser.emailAddresses?.[0]?.emailAddress ??
      authUser.primaryEmailAddress?.emailAddress ??
      "";

    // Find the database user (same logic as upsertStore)
    let dbUser = await db.user.findUnique({
      where: { id: authUser.id },
    });

    // If not found by id, try to find by email
    if (!dbUser) {
      dbUser = await db.user.findUnique({
        where: { email: clerkEmail },
      });
    }

    // If still not found, create the user
    if (!dbUser) {
      dbUser = await db.user.create({
        data: {
          id: authUser.id,
          name:
            authUser.firstName || authUser.lastName
              ? `${authUser.firstName || ""} ${authUser.lastName || ""}`.trim()
              : authUser.username || authUser.id,
          email: clerkEmail,
          image_url: authUser.imageUrl,
          role: "SELLER",
        },
      });
    }

    // Ensure the store URL is provided
    if (!storeUrl) throw new Error("Store URL is required.");

    // Find the store by URL
    const store = await db.store.findUnique({
      where: {
        url: storeUrl,
      },
    });

    if (!store) throw new Error("Store could not be found.");

    // Make sure seller is accessing their own store
    if (store.userId !== dbUser.id) {
      throw new Error(
        "Make sure you have the permissions to access this store"
      );
    }

    // Retrieve all countries
    const countries = await db.country.findMany({
      orderBy: {
        name: "asc",
      },
    });

    // Retrieve all shipping rates for the specified store
    // Type assertion needed until Prisma client is regenerated with: npx prisma generate
    const shippingRates = await (db as any).shippingRate.findMany({
      where: {
        storeId: store.id,
      },
    });

    // Create a map for quick lookup of shipping rates by country ID
    const rateMap = new Map<string, any>();
    shippingRates.forEach((rate: any) => {
      rateMap.set(rate.countryId, rate);
    });

    // Map countries to their shipping rates
    const result = countries.map((country) => ({
      countryId: country.id,
      countryName: country.name,
      shippingRate: rateMap.get(country.id) || null,
    }));

    return result;
  } catch (error) {
    console.error("Error retrieving store shipping rates:", error);
    throw error;
  }
};











// Function: upsertShippingRate
// Description: Upserts a shipping rate for a specific country, updating if it exists or creating a new one if not.
// Permission Level: Seller only
// Parameters:
//   - storeUrl: Url of the store you are trying to update.
//   - shippingRate: ShippingRate object containing the details of the shipping rate to be upserted.
// Returns: Updated or newly created shipping rate details.
export const upsertShippingRate = async (
  storeUrl: string,
  shippingRate: ShippingRate
) => {
  try {
    // Get current user from Clerk
    const authUser = await currentUser();

    // Ensure user is authenticated
    if (!authUser) throw new Error("Unauthenticated.");

    // Get the email from Clerk
    const clerkEmail =
      authUser.emailAddresses?.[0]?.emailAddress ??
      authUser.primaryEmailAddress?.emailAddress ??
      "";

    // Find the database user (same logic as upsertStore)
    let dbUser = await db.user.findUnique({
      where: { id: authUser.id },
    });

    // If not found by id, try to find by email
    if (!dbUser) {
      dbUser = await db.user.findUnique({
        where: { email: clerkEmail },
      });
    }

    // If still not found, create the user
    if (!dbUser) {
      dbUser = await db.user.create({
        data: {
          id: authUser.id,
          name:
            authUser.firstName || authUser.lastName
              ? `${authUser.firstName || ""} ${authUser.lastName || ""}`.trim()
              : authUser.username || authUser.id,
          email: clerkEmail,
          image_url: authUser.imageUrl,
          role: "SELLER",
        },
      });
    }

    // Ensure shipping rate data is provided
    if (!shippingRate) throw new Error("Please provide shipping rate data.");

    // Ensure countryId is provided
    if (!shippingRate.countryId)
      throw new Error("Please provide a valid country ID.");

    // Ensure the store URL is provided
    if (!storeUrl) throw new Error("Store URL is required.");

    // Find the store by URL
    const store = await db.store.findUnique({
      where: {
        url: storeUrl,
      },
    });

    if (!store) throw new Error("Store could not be found.");

    // Make sure seller is updating their own store
    if (store.userId !== dbUser.id) {
      throw new Error(
        "Make sure you have the permissions to update this store"
      );
    }

    // Check if shipping rate already exists for this store and country
    const existingRate = await (db as any).shippingRate.findFirst({
      where: {
        storeId: store.id,
        countryId: shippingRate.countryId,
      },
    });

    // Upsert the shipping rate into the database
    let shippingRateDetails;
    if (existingRate) {
      // Update existing rate
      shippingRateDetails = await (db as any).shippingRate.update({
        where: {
          id: existingRate.id,
        },
        data: {
          shippingService: shippingRate.shippingService,
          shippingFeePerItem: shippingRate.shippingFeePerItem,
          shippingFeeForAdditionalItem: shippingRate.shippingFeeForAdditionalItem,
          shippingFeePerKg: shippingRate.shippingFeePerKg,
          shippingFeeFixed: shippingRate.shippingFeeFixed,
          deliveryTimeMin: shippingRate.deliveryTimeMin,
          deliveryTimeMax: shippingRate.deliveryTimeMax,
          returnPolicy: shippingRate.returnPolicy,
        },
      });
    } else {
      // Create new rate
      shippingRateDetails = await (db as any).shippingRate.create({
        data: {
          id: shippingRate.id || v4(),
          shippingService: shippingRate.shippingService,
          shippingFeePerItem: shippingRate.shippingFeePerItem,
          shippingFeeForAdditionalItem: shippingRate.shippingFeeForAdditionalItem,
          shippingFeePerKg: shippingRate.shippingFeePerKg,
          shippingFeeFixed: shippingRate.shippingFeeFixed,
          deliveryTimeMin: shippingRate.deliveryTimeMin,
          deliveryTimeMax: shippingRate.deliveryTimeMax,
          returnPolicy: shippingRate.returnPolicy,
          countryId: shippingRate.countryId,
          storeId: store.id,
        },
      });
    }

    return shippingRateDetails;
  } catch (error) {
    // Log and re-throw any errors
    console.log(error);
    throw error;
  }
};
