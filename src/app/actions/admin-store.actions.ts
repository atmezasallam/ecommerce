"use server";

import { Prisma } from "@prisma/client";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

import prisma from "@/lib/prisma";
import { isPlatformAdmin } from "@/src/lib/admin-access";
import { StoreFormSchema } from "@/src/lib/schema";

type StoreStatus = "PENDING" | "ACTIVE" | "BANNED" | "DISABLED";

const AdminStoreBasicsSchema = StoreFormSchema.pick({
  name: true,
  url: true,
  email: true,
  phone: true,
});

function buildRedirectFromForm(formData: FormData, extra?: Record<string, string>) {
  const rs = formData.get("returnSearch");
  const params = new URLSearchParams(typeof rs === "string" && rs.length > 0 ? rs : "");
  if (extra) {
    for (const [k, v] of Object.entries(extra)) {
      if (v !== undefined && v !== "") params.set(k, v);
    }
  }
  const qs = params.toString();
  return qs ? `/dashboard/admin/stores?${qs}` : `/dashboard/admin/stores`;
}

async function requirePlatformAdmin() {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  if (!isPlatformAdmin(dbUser?.role, user.privateMetadata?.role)) {
    throw new Error("Unauthorized");
  }
}

export async function updateStoreStatus(formData: FormData): Promise<void> {
  await requirePlatformAdmin();

  const storeId = formData.get("storeId");
  const status = formData.get("status");

  if (typeof storeId !== "string" || storeId.length === 0) {
    throw new Error("Missing store id");
  }
  if (status !== "PENDING" && status !== "ACTIVE" && status !== "BANNED" && status !== "DISABLED") {
    throw new Error("Invalid status");
  }

  const existingStore = await prisma.store.findUnique({
    where: { id: storeId },
    select: { id: true, userId: true },
  });
  if (!existingStore) {
    throw new Error("Store not found");
  }

  await prisma.store.update({
    where: { id: storeId },
    data: { status: status as StoreStatus },
  });

  if (status === "ACTIVE") {
    await prisma.user.update({
      where: { id: existingStore.userId },
      data: { role: "SELLER" },
    });

    const client = await clerkClient();
    const clerkRecord = await client.users.getUser(existingStore.userId);
    const prevPrivate = (clerkRecord.privateMetadata ?? {}) as Record<string, unknown>;
    await client.users.updateUser(existingStore.userId, {
      privateMetadata: {
        ...prevPrivate,
        role: "SELLER",
      },
    });
  } else {
    const activeStoresCount = await prisma.store.count({
      where: { userId: existingStore.userId, status: "ACTIVE" },
    });
    if (activeStoresCount === 0) {
      await prisma.user.update({
        where: { id: existingStore.userId },
        data: { role: "USER" },
      });

      const client = await clerkClient();
      const clerkRecord = await client.users.getUser(existingStore.userId);
      const prevPrivate = (clerkRecord.privateMetadata ?? {}) as Record<string, unknown>;
      await client.users.updateUser(existingStore.userId, {
        privateMetadata: {
          ...prevPrivate,
          role: "USER",
        },
      });
    }
  }

  revalidatePath("/dashboard/admin/stores");
  revalidatePath(`/dashboard/admin/stores/${storeId}`);
  revalidatePath("/dashboard/admin");
  revalidateTag("admin:stores");
  revalidateTag("admin:dashboard");
}

export async function adminUpdateStoreBasics(formData: FormData): Promise<void> {
  await requirePlatformAdmin();

  const storeId = formData.get("storeId");
  if (typeof storeId !== "string" || storeId.length === 0) {
    redirect(buildRedirectFromForm(formData, { err: "Missing store id" }));
  }

  const raw = {
    name: String(formData.get("name") ?? "").trim(),
    url: String(formData.get("url") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
  };

  const parsed = AdminStoreBasicsSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? "Invalid input";
    redirect(buildRedirectFromForm(formData, { err: first }));
  }

  const { name, url, email, phone } = parsed.data;

  const existing = await prisma.store.findUnique({
    where: { id: storeId },
    select: { id: true },
  });
  if (!existing) {
    redirect(buildRedirectFromForm(formData, { err: "Store not found" }));
  }

  try {
    await prisma.store.update({
      where: { id: storeId },
      data: { name, url, email, phone },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      redirect(
        buildRedirectFromForm(formData, {
          err: "Store URL or email is already in use by another store.",
        }),
      );
    }
    throw e;
  }

  revalidatePath("/dashboard/admin/stores");
  revalidatePath(`/dashboard/admin/stores/${storeId}`);
  revalidatePath("/dashboard/admin");
  revalidateTag("admin:stores");
  revalidateTag("admin:dashboard");
}

export async function adminSetStoreFeatured(formData: FormData): Promise<void> {
  await requirePlatformAdmin();

  const storeId = formData.get("storeId");
  const featuredRaw = formData.get("featured");

  if (typeof storeId !== "string" || storeId.length === 0) {
    redirect(buildRedirectFromForm(formData, { err: "Missing store id" }));
  }

  if (featuredRaw !== "true" && featuredRaw !== "false") {
    redirect(buildRedirectFromForm(formData, { err: "Invalid featured value" }));
  }

  const featured = featuredRaw === "true";

  const existing = await prisma.store.findUnique({
    where: { id: storeId },
    select: { id: true },
  });
  if (!existing) {
    redirect(buildRedirectFromForm(formData, { err: "Store not found" }));
  }

  await prisma.store.update({
    where: { id: storeId },
    data: { featured },
  });

  revalidatePath("/dashboard/admin/stores");
  revalidatePath(`/dashboard/admin/stores/${storeId}`);
  revalidatePath("/dashboard/admin");
  revalidateTag("admin:stores");
  revalidateTag("admin:dashboard");
}
