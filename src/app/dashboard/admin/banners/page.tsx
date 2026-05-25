import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getActiveAnnouncementBar, getAllBanners } from "@/src/app/actions/banner.actions";
import BannerManagementClient from "@/src/components/admin/banners/BannerManagementClient";
import { isPlatformAdmin } from "@/src/lib/admin-access";

export default async function DashboardAdminBannersPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const [dbUser, clerkUser] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { role: true } }),
    currentUser(),
  ]);
  if (!isPlatformAdmin(dbUser?.role, clerkUser?.privateMetadata?.role)) redirect("/");

  const [banners, announcementBar] = await Promise.all([getAllBanners(), getActiveAnnouncementBar()]);

  return <BannerManagementClient banners={banners} announcementBar={announcementBar} />;
}
