import { ReactNode } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import prisma from "@/lib/prisma";
import { getTotalUnreadCount } from "@/src/app/actions/message.actions";
import Header from "@/src/components/dashboard/header/header";
import Sidebar from "@/src/components/dashboard/sidebar/sidebar";

export default async function SellerMessagesShellLayout({ children }: { children: ReactNode }) {
  const authUser = await currentUser();
  if (!authUser) {
    redirect("/");
  }

  const clerkEmail =
    authUser.emailAddresses?.[0]?.emailAddress ??
    authUser.primaryEmailAddress?.emailAddress ??
    "";

  let dbUser =
    (await prisma.user.findUnique({ where: { id: authUser.id } })) ??
    (clerkEmail ? await prisma.user.findUnique({ where: { email: clerkEmail } }) : null);

  if (!dbUser) {
    redirect("/dashboard/seller/stores");
  }

  const [stores, messageUnreadCount] = await Promise.all([
    prisma.store.findMany({
      where: { userId: dbUser.id },
    }),
    getTotalUnreadCount(),
  ]);

  if (stores.length === 0) {
    redirect("/dashboard/seller/stores/new");
  }

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar stores={stores} messageUnreadCount={messageUnreadCount} />
      <div className="ml-[300px] flex min-h-screen min-w-0 flex-1 flex-col">
        <Header />
        <div className="w-full flex-1 p-4 pt-[75px]">{children}</div>
      </div>
    </div>
  );
}
