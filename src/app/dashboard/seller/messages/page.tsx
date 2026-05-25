import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import prisma from "@/lib/prisma";
import { getConversations } from "@/src/app/actions/message.actions";
import MessagesLayout from "@/src/components/messages/MessagesLayout";

export default async function SellerMessagesPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const store = await prisma.store.findFirst({
    where: { userId },
    select: { id: true },
  });
  if (!store) {
    redirect("/dashboard/seller/stores/new");
  }

  const conversations = await getConversations("SELLER");

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
        <p className="text-sm text-muted-foreground">Chats with buyers</p>
      </div>
      <Suspense fallback={<div className="text-sm text-muted-foreground">Loading…</div>}>
        <MessagesLayout initialConversations={conversations} role="SELLER" />
      </Suspense>
    </div>
  );
}
