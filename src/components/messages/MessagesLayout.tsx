"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MessageSquare } from "lucide-react";

import type { ConversationBuyerView, ConversationSellerView } from "@/types/message.types";
import { getConversations } from "@/src/app/actions/message.actions";
import ConversationList from "@/src/components/messages/ConversationList";
import MessageThread from "@/src/components/messages/MessageThread";
import { cn } from "@/src/lib/utils";

type MessagesLayoutProps = {
  initialConversations: ConversationBuyerView[] | ConversationSellerView[];
  role: "BUYER" | "SELLER";
};

export default function MessagesLayout({ initialConversations, role }: MessagesLayoutProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramId = searchParams.get("conversationId") ?? undefined;

  const [conversations, setConversations] = useState(initialConversations);
  const [mobileShowThread, setMobileShowThread] = useState(false);

  useEffect(() => {
    setConversations(initialConversations);
  }, [initialConversations]);

  useEffect(() => {
    const t = window.setInterval(() => {
      void getConversations(role).then(setConversations);
    }, 4000);
    return () => window.clearInterval(t);
  }, [role]);

  const selectedId = paramId;

  const selected = useMemo(() => {
    if (!selectedId) return null;
    return conversations.find((c) => c.id === selectedId) ?? null;
  }, [conversations, selectedId]);

  useEffect(() => {
    if (paramId) {
      setMobileShowThread(true);
    }
  }, [paramId]);

  const setConversationId = useCallback(
    (id: string) => {
      const base = role === "BUYER" ? "/profile/messages" : "/dashboard/seller/messages";
      router.push(`${base}?conversationId=${id}`);
      setMobileShowThread(true);
    },
    [router, role]
  );

  useEffect(() => {
    if (!paramId && conversations.length > 0) {
      const base = role === "BUYER" ? "/profile/messages" : "/dashboard/seller/messages";
      router.replace(`${base}?conversationId=${conversations[0].id}`);
    }
  }, [paramId, conversations, router, role]);

  const onDeleted = useCallback(() => {
    const next = conversations.filter((c) => c.id !== selectedId);
    setConversations(next);
    const base = role === "BUYER" ? "/profile/messages" : "/dashboard/seller/messages";
    if (next[0]) {
      router.replace(`${base}?conversationId=${next[0].id}`);
    } else {
      router.replace(base);
      setMobileShowThread(false);
    }
  }, [router, role, selectedId, conversations]);

  const emptySelect = !selected && conversations.length > 0 && !paramId;

  return (
    <div className="flex h-[calc(100vh-8rem)] min-h-[480px] w-full overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div
        className={cn(
          "flex w-full min-w-0 flex-col lg:w-[min(380px,100%)]",
          mobileShowThread && selected ? "hidden lg:flex" : "flex"
        )}
      >
        <ConversationList
          conversations={conversations}
          role={role}
          selectedId={selectedId}
          onSelect={setConversationId}
        />
      </div>

      <div
        className={cn(
          "min-w-0 flex-1 flex-col",
          mobileShowThread && selected ? "flex" : "hidden lg:flex"
        )}
      >
        {selected ? (
          <MessageThread
            conversationId={selected.id}
            role={role}
            conversation={selected}
            onDeleted={onDeleted}
            showBack
            onBack={() => {
              setMobileShowThread(false);
              const base = role === "BUYER" ? "/profile/messages" : "/dashboard/seller/messages";
              router.push(base);
            }}
          />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center text-muted-foreground">
            <MessageSquare className="h-16 w-16 opacity-30" />
            <p className="text-lg font-medium text-foreground">Select a conversation</p>
            <p className="max-w-sm text-sm">
              Choose a thread on the left to read and reply, or send a new message to a seller.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
