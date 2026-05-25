import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getActiveAnnouncementBar, getAllBanners } from "@/src/app/actions/banner.actions";
import BannerManagementClient from "@/src/components/admin/banners/BannerManagementClient";

export default async function AdminBannersPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const [dbUser, clerkUser] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { role: true } }),
    currentUser(),
  ]);
  const isAdmin = dbUser?.role === "ADMIN" || clerkUser?.privateMetadata?.role === "ADMIN";
  if (!isAdmin) redirect("/");

  const [banners, announcementBar] = await Promise.all([getAllBanners(), getActiveAnnouncementBar()]);

  return (
    <div className="p-6 md:p-8">
      <BannerManagementClient banners={banners} announcementBar={announcementBar} />
    </div>
  );
}
