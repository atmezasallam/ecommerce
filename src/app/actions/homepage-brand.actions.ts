"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import prisma from "@/lib/prisma";

const HOMEPAGE_BRANDS_TAG = "homepage-brands";

async function assertAdmin() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (user?.role === "ADMIN") return;

  const clerkUser = await currentUser();
  if (clerkUser?.privateMetadata?.role === "ADMIN") return;

  throw new Error("Forbidden");
}

export type HomepageBrandFormData = {
  name: string;
  logo: string;
  href: string;
  isActive: boolean;
};

export async function getActiveHomepageBrands() {
  const cached = unstable_cache(
    async () =>
      prisma.homepageBrand.findMany({
        where: { isActive: true },
        orderBy: { position: "asc" },
      }),
    ["active-homepage-brands"],
    { revalidate: 300, tags: [HOMEPAGE_BRANDS_TAG] }
  );
  return cached();
}

export async function getAllHomepageBrands() {
  await assertAdmin();
  return prisma.homepageBrand.findMany({
    orderBy: { position: "asc" },
  });
}

export async function createHomepageBrand(data: HomepageBrandFormData) {
  await assertAdmin();
  const maxPos = await prisma.homepageBrand.aggregate({ _max: { position: true } });
  const position = (maxPos._max.position ?? -1) + 1;
  await prisma.homepageBrand.create({
    data: {
      name: data.name,
      logo: data.logo,
      href: data.href || "/browse",
      isActive: data.isActive,
      position,
    },
  });
  revalidatePath("/");
  revalidatePath("/dashboard/admin/homepage-brands");
  revalidateTag(HOMEPAGE_BRANDS_TAG);
}

export async function updateHomepageBrand(id: string, data: Partial<HomepageBrandFormData>) {
  await assertAdmin();
  await prisma.homepageBrand.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.logo !== undefined && { logo: data.logo }),
      ...(data.href !== undefined && { href: data.href || "/browse" }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
  });
  revalidatePath("/");
  revalidatePath("/dashboard/admin/homepage-brands");
  revalidateTag(HOMEPAGE_BRANDS_TAG);
}

export async function deleteHomepageBrand(id: string) {
  await assertAdmin();
  await prisma.homepageBrand.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/dashboard/admin/homepage-brands");
  revalidateTag(HOMEPAGE_BRANDS_TAG);
}

export async function reorderHomepageBrands(ids: string[]) {
  await assertAdmin();
  await Promise.all(ids.map((id, index) => prisma.homepageBrand.update({ where: { id }, data: { position: index } })));
  revalidatePath("/");
  revalidatePath("/dashboard/admin/homepage-brands");
  revalidateTag(HOMEPAGE_BRANDS_TAG);
}
