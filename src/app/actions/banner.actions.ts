"use server";

import type { BannerType } from "@prisma/client";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import prisma from "@/lib/prisma";
import type { AnnouncementBarFormData, BannerFormData } from "@/types/banner.types";

const BANNERS_TAG = "banners";

async function assertAdmin() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (user?.role === "ADMIN") return;

  const clerkUser = await currentUser();
  if (clerkUser?.privateMetadata?.role === "ADMIN") return;

  throw new Error("Forbidden");
}

export async function getActiveBanners(type: BannerType) {
  const cached = unstable_cache(
    async () =>
      prisma.banner.findMany({
        where: {
          type,
          status: "ACTIVE",
          OR: [{ startDate: null }, { startDate: { lte: new Date() } }],
          AND: [{ OR: [{ endDate: null }, { endDate: { gte: new Date() } }] }],
        },
        orderBy: { position: "asc" },
      }),
    ["active-banners", type],
    { revalidate: 300, tags: [BANNERS_TAG] }
  );

  return cached();
}

export async function getActiveAnnouncementBar() {
  const cached = unstable_cache(
    async () =>
      prisma.announcementBar.findFirst({
        where: {
          isActive: true,
          OR: [{ showFrom: null }, { showFrom: { lte: new Date() } }],
          AND: [{ OR: [{ showUntil: null }, { showUntil: { gte: new Date() } }] }],
        },
      }),
    ["active-announcement-bar"],
    { revalidate: 300, tags: [BANNERS_TAG] }
  );

  return cached();
}

export async function getAllBanners() {
  await assertAdmin();
  return prisma.banner.findMany({
    orderBy: [{ type: "asc" }, { position: "asc" }],
  });
}

export async function createBanner(data: BannerFormData) {
  await assertAdmin();
  await prisma.banner.create({ data });
  revalidatePath("/");
  revalidatePath("/admin/banners");
  revalidatePath("/dashboard/admin/banners");
  revalidateTag(BANNERS_TAG);
}

export async function updateBanner(id: string, data: Partial<BannerFormData>) {
  await assertAdmin();
  await prisma.banner.update({
    where: { id },
    data,
  });
  revalidatePath("/");
  revalidatePath("/admin/banners");
  revalidatePath("/dashboard/admin/banners");
  revalidateTag(BANNERS_TAG);
}

export async function deleteBanner(id: string) {
  await assertAdmin();
  await prisma.banner.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/banners");
  revalidatePath("/dashboard/admin/banners");
  revalidateTag(BANNERS_TAG);
}

export async function reorderBanners(ids: string[]) {
  await assertAdmin();
  await Promise.all(ids.map((id, index) => prisma.banner.update({ where: { id }, data: { position: index } })));
  revalidatePath("/");
  revalidatePath("/admin/banners");
  revalidatePath("/dashboard/admin/banners");
  revalidateTag(BANNERS_TAG);
}

export async function incrementBannerClick(id: string) {
  await prisma.banner.update({
    where: { id },
    data: { clicks: { increment: 1 } },
  });
}

export async function createOrUpdateAnnouncementBar(data: AnnouncementBarFormData) {
  await assertAdmin();

  const existing = await prisma.announcementBar.findFirst({ select: { id: true } });
  const payload = {
    messages: JSON.stringify(data.messages),
    bgColor: data.bgColor,
    textColor: data.textColor,
    speed: data.speed,
    isActive: data.isActive,
    showFrom: data.showFrom ?? null,
    showUntil: data.showUntil ?? null,
  };

  if (existing) {
    await prisma.announcementBar.update({
      where: { id: existing.id },
      data: payload,
    });
  } else {
    await prisma.announcementBar.create({ data: payload });
  }

  revalidatePath("/");
  revalidatePath("/admin/banners");
  revalidatePath("/dashboard/admin/banners");
  revalidateTag(BANNERS_TAG);
}
