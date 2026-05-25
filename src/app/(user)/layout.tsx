import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getTotalUnreadCount } from "@/src/app/actions/message.actions";
import { getRequestOrigin } from "@/src/lib/request-origin";
import { UserAccountSidebar } from "@/src/components/user/UserAccountSidebar";
import { ArrowLeft } from "lucide-react";

export default async function UserAccountLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const [dbUser, existingStore, messageUnreadCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    }),
    prisma.store.findFirst({
      where: { userId },
      select: { id: true },
    }),
    getTotalUnreadCount(),
  ]);
  const dbRole = dbUser?.role ?? "USER";
  const hasStore = Boolean(existingStore);
  const becomeSellerAbsoluteUrl = `${getRequestOrigin()}/become-a-seller`;

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Salamo
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <UserAccountSidebar
              dbRole={dbRole}
              hasStore={hasStore}
              becomeSellerAbsoluteUrl={becomeSellerAbsoluteUrl}
              messageUnreadCount={messageUnreadCount}
            />
          </div>
          <main className="min-w-0 lg:col-span-3">{children}</main>
        </div>
      </div>
    </div>
  );
}
