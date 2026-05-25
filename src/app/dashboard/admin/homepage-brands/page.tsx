import { auth, currentUser } from "@clerk/nextjs/server";
import { unstable_cache } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import HomepageBrandsManagementClient from "@/src/components/admin/homepage-brands/HomepageBrandsManagementClient";
import { isPlatformAdmin } from "@/src/lib/admin-access";

export default async function AdminHomepageBrandsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const [dbUser, clerkUser] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    }),
    currentUser(),
  ]);
  if (!isPlatformAdmin(dbUser?.role, clerkUser?.privateMetadata?.role)) {
    redirect("/");
  }

  const getCachedHomepageBrandsForAdmin = unstable_cache(
    async () =>
      prisma.homepageBrand.findMany({
        orderBy: { position: "asc" },
      }),
    ["admin-homepage-brands"],
    { revalidate: 30, tags: ["homepage-brands"] }
  );

  const brands = await getCachedHomepageBrandsForAdmin();

  return <HomepageBrandsManagementClient brands={brands} />;
}
