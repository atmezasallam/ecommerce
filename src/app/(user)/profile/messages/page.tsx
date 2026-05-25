import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { getConversations } from "@/src/app/actions/message.actions";
import MessagesLayout from "@/src/components/messages/MessagesLayout";

export default async function ProfileMessagesPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const conversations = await getConversations("BUYER");

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
        <p className="text-sm text-muted-foreground">Conversations with sellers</p>
      </div>
      <Suspense fallback={<div className="text-sm text-muted-foreground">Loading…</div>}>
        <MessagesLayout initialConversations={conversations} role="BUYER" />
      </Suspense>
    </div>
  );
}
