"use server";

import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { findOrCreateDbUserForClerk } from "@/src/lib/ensure-db-user";
import slugify from "slugify";
import { z } from "zod";

const SETTINGS_COOKIE = "salamo_account_settings";

export type AccountSettingsState = {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  newsletterPromotions: boolean;
  language: string;
  currency: string;
  showProfileToSellers: boolean;
  personalizedRecommendations: boolean;
};

const defaultSettings: AccountSettingsState = {
  emailNotifications: true,
  smsNotifications: false,
  pushNotifications: true,
  newsletterPromotions: true,
  language: "English",
  currency: "USD",
  showProfileToSellers: false,
  personalizedRecommendations: true,
};

function parseSettings(raw: string | undefined): AccountSettingsState {
  if (!raw) return { ...defaultSettings };
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return { ...defaultSettings };
    return { ...defaultSettings, ...(parsed as Partial<AccountSettingsState>) };
  } catch {
    return { ...defaultSettings };
  }
}

export async function getAccountSettings(): Promise<AccountSettingsState> {
  const { userId } = await auth();
  if (!userId) return { ...defaultSettings };
  const jar = cookies();
  const raw = jar.get(SETTINGS_COOKIE)?.value;
  return parseSettings(raw);
}

const updateProfileSchema = z.object({
  name: z.string().min(2).max(50),
  image_url: z
    .string()
    .optional()
    .refine((val) => val === undefined || val.length === 0 || /^https?:\/\/.+/i.test(val), {
      message: "Invalid image URL",
    }),
});

export async function removeProfilePhoto(): Promise<{ success: boolean; message: string }> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, message: "You must be signed in." };
    }

    const dbUser = await findOrCreateDbUserForClerk();

    await prisma.user.update({
      where: { id: dbUser.id },
      data: { image_url: null },
    });

    revalidatePath("/profile");
    revalidatePath("/profile", "layout");
    revalidatePath("/settings", "layout");
    return { success: true, message: "Profile photo removed." };
  } catch (e) {
    console.error("removeProfilePhoto", e);
    return { success: false, message: "Could not remove photo. Try again." };
  }
}

export async function updateProfile(data: {
  name: string;
  image_url?: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, message: "You must be signed in." };
    }
    const parsed = updateProfileSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, message: parsed.error.flatten().fieldErrors.name?.[0] ?? "Invalid input." };
    }
    const nextImage =
      parsed.data.image_url && parsed.data.image_url.length > 0 ? parsed.data.image_url : undefined;

    const dbUser = await findOrCreateDbUserForClerk();

    await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        name: parsed.data.name,
        ...(nextImage !== undefined ? { image_url: nextImage } : {}),
      },
    });
    revalidatePath("/profile");
    revalidatePath("/profile", "layout");
    revalidatePath("/settings", "layout");
    return { success: true, message: "Profile updated successfully." };
  } catch (e) {
    console.error("updateProfile", e);
    return { success: false, message: "Could not update profile. Try again." };
  }
}

const updateSettingsSchema = z.object({
  emailNotifications: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  newsletterPromotions: z.boolean().optional(),
  language: z.string().min(1).optional(),
  currency: z.string().min(1).optional(),
  showProfileToSellers: z.boolean().optional(),
  personalizedRecommendations: z.boolean().optional(),
});

export async function updateSettings(data: {
  emailNotifications: boolean;
  smsNotifications: boolean;
  language: string;
  currency: string;
  pushNotifications?: boolean;
  newsletterPromotions?: boolean;
  showProfileToSellers?: boolean;
  personalizedRecommendations?: boolean;
}): Promise<{ success: boolean }> {
  const { userId } = await auth();
  if (!userId) return { success: false };

  const parsed = updateSettingsSchema.safeParse(data);
  if (!parsed.success) return { success: false };

  const jar = cookies();
  const prev = parseSettings(jar.get(SETTINGS_COOKIE)?.value);
  const next: AccountSettingsState = {
    ...prev,
    ...parsed.data,
    emailNotifications: parsed.data.emailNotifications ?? prev.emailNotifications,
    smsNotifications: parsed.data.smsNotifications ?? prev.smsNotifications,
    pushNotifications: parsed.data.pushNotifications ?? prev.pushNotifications,
    newsletterPromotions: parsed.data.newsletterPromotions ?? prev.newsletterPromotions,
    language: parsed.data.language ?? prev.language,
    currency: parsed.data.currency ?? prev.currency,
    showProfileToSellers: parsed.data.showProfileToSellers ?? prev.showProfileToSellers,
    personalizedRecommendations:
      parsed.data.personalizedRecommendations ?? prev.personalizedRecommendations,
  };

  jar.set(SETTINGS_COOKIE, JSON.stringify(next), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    secure: process.env.NODE_ENV === "production",
  });

  revalidatePath("/settings");
  return { success: true };
}

const sellerApplicationSchema = z.object({
  storeName: z.string().min(3).max(50),
  storeUrl: z.string().min(2).max(60),
  storeEmail: z.string().email(),
  storePhone: z.string().min(5).max(30),
  storeDescription: z.string().min(50).max(5000),
  storeCategory: z.string().min(1).max(100),
});

export async function checkStoreUrlAvailable(
  handle: string
): Promise<{ available: boolean; normalized: string }> {
  const normalized = slugify(handle.trim(), { lower: true, strict: true, trim: true });
  if (!normalized) return { available: false, normalized: "" };
  const existing = await prisma.store.findUnique({
    where: { url: normalized },
    select: { id: true },
  });
  return { available: !existing, normalized };
}

export async function submitSellerApplication(data: {
  storeName: string;
  storeUrl: string;
  storeEmail: string;
  storePhone: string;
  storeDescription: string;
  storeCategory: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, message: "You must be signed in." };
    }

    const parsed = sellerApplicationSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, message: "Please check all fields and try again." };
    }

    const url = slugify(parsed.data.storeUrl.trim(), { lower: true, strict: true, trim: true });
    if (!url) {
      return { success: false, message: "Store URL handle is invalid." };
    }

    const taken = await prisma.store.findUnique({ where: { url }, select: { id: true } });
    if (taken) {
      return { success: false, message: "That store URL is already taken." };
    }

    const existing = await prisma.store.findFirst({ where: { userId }, select: { id: true } });
    if (existing) {
      return { success: false, message: "Already applied" };
    }

    const clerkUser = await currentUser();
    const clerkEmail =
      clerkUser?.emailAddresses?.[0]?.emailAddress ??
      clerkUser?.primaryEmailAddress?.emailAddress ??
      "";

    let dbUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!dbUser && clerkEmail) {
      dbUser = await prisma.user.findUnique({ where: { email: clerkEmail } });
    }
    if (!dbUser) {
      if (!clerkEmail) {
        return { success: false, message: "A verified email is required to apply." };
      }
      await prisma.user.create({
        data: {
          id: userId,
          name:
            clerkUser?.firstName || clerkUser?.lastName
              ? `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim()
              : clerkUser?.username ?? userId,
          email: clerkEmail,
          image_url: clerkUser?.imageUrl ?? null,
          role: "USER",
        },
      });
    }

    const fullDescription = `${parsed.data.storeDescription}\n\n— Salamo seller category: ${parsed.data.storeCategory}`;

    await prisma.store.create({
      data: {
        name: parsed.data.storeName.trim(),
        description: fullDescription,
        email: parsed.data.storeEmail.trim(),
        phone: parsed.data.storePhone.trim(),
        url,
        logo: "",
        cover: "",
        userId,
        status: "PENDING",
      },
    });

    revalidatePath("/become-a-seller");
    revalidatePath("/dashboard/seller");
    return { success: true, message: "Application submitted successfully. Waiting for admin approval." };
  } catch (e) {
    console.error("submitSellerApplication", e);
    return { success: false, message: "Could not submit application. Try again." };
  }
}

const disputeSchema = z.object({
  orderNumber: z.string().min(1, "Order number is required"),
  reason: z.enum([
    "Item not received",
    "Item not as described",
    "Wrong item sent",
    "Damaged item",
    "Refund not received",
    "Other",
  ]),
  description: z.string().min(50, "Please provide details (min 50 chars)"),
  contactEmail: z.string().email(),
});

export async function submitDispute(data: {
  orderNumber: string;
  reason: string;
  description: string;
  contactEmail: string;
}): Promise<{ success: boolean; message: string }> {
  const parsed = disputeSchema.safeParse(data);
  if (!parsed.success) {
    const msg = parsed.error.flatten().fieldErrors.description?.[0] ?? "Invalid form data.";
    return { success: false, message: msg };
  }
  return { success: true, message: "Dispute recorded. Our team will follow up by email." };
}

const reportProblemSchema = z.object({
  type: z.string().min(1),
  subject: z.string().min(5).max(100),
  description: z.string().min(30),
  contactEmail: z.string().email(),
});

export async function reportProblem(data: {
  type: string;
  subject: string;
  description: string;
  contactEmail: string;
}): Promise<{ success: boolean; message: string }> {
  const parsed = reportProblemSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, message: "Please fix the errors and try again." };
  }
  return { success: true, message: "Report received. Thank you for helping improve Salamo." };
}

export async function getProfilePageData(): Promise<{
  user: {
    id: string;
    name: string;
    email: string;
    image_url: string | null;
    role: "USER" | "ADMIN" | "SELLER";
    createdAt: Date;
  } | null;
}> {
  const { userId } = await auth();
  if (!userId) return { user: null };

  try {
    const dbUser = await findOrCreateDbUserForClerk();
    return {
      user: {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        image_url: dbUser.image_url,
        role: dbUser.role,
        createdAt: dbUser.createdAt,
      },
    };
  } catch {
    return { user: null };
  }
}

export async function getBecomeSellerPageData(): Promise<{
  store: {
    id: string;
    name: string;
    url: string;
    email: string;
    phone: string;
    status: "PENDING" | "ACTIVE" | "BANNED" | "DISABLED";
    description: string;
  } | null;
  categories: { id: string; name: string; url: string }[];
}> {
  const { userId } = await auth();
  if (!userId) return { store: null, categories: [] };

  const [store, categories] = await Promise.all([
    prisma.store.findFirst({
      where: { userId },
      select: {
        id: true,
        name: true,
        url: true,
        email: true,
        phone: true,
        status: true,
        description: true,
      },
    }),
    prisma.category.findMany({
      select: { id: true, name: true, url: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return { store, categories };
}
