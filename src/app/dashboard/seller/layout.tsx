import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import SellerThemeFallback from "@/src/components/dashboard/seller-theme-fallback";

function sellerShell(children: React.ReactNode) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SellerThemeFallback />
      {children}
    </div>
  );
}

export default async function SellerDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user) {
    redirect("/");
  }

  const clerkRole = user.privateMetadata?.role;
  const clerkAllowed = clerkRole === "SELLER" || clerkRole === "ADMIN";
  if (clerkAllowed) {
    return sellerShell(children);
  }

  const clerkEmail =
    user.emailAddresses?.[0]?.emailAddress ?? user.primaryEmailAddress?.emailAddress ?? "";

  let dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  if (!dbUser && clerkEmail) {
    dbUser = await prisma.user.findUnique({
      where: { email: clerkEmail },
      select: { role: true },
    });
  }

  if (dbUser?.role === "SELLER" || dbUser?.role === "ADMIN") {
    return sellerShell(children);
  }

  redirect("/");
}