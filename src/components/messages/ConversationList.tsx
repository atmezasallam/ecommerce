"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { MessageSquare } from "lucide-react";

import type { ConversationBuyerView, ConversationSellerView } from "@/types/message.types";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { cn } from "@/src/lib/utils";
import { formatListTime } from "@/src/lib/message-date";
import NewMessageDialog from "@/src/components/messages/NewMessageDialog";

type ConversationListProps = {
  conversations: ConversationBuyerView[] | ConversationSellerView[];
  role: "BUYER" | "SELLER";
  selectedId?: string;
  onSelect: (id: string) => void;
};

export default function ConversationList({
  conversations,
  role,
  selectedId,
  onSelect,
}: ConversationListProps) {
  const [q, setQ] = useState("");
  const [newOpen, setNewOpen] = useState(false);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return conversations;
    return conversations.filter((c) => {
      if (role === "BUYER") {
        const b = c as ConversationBuyerView;
        return b.store.name.toLowerCase().includes(needle);
      }
      const s = c as ConversationSellerView;
      return s.buyer.name.toLowerCase().includes(needle);
    });
  }, [conversations, q, role]);

  const unread = (c: ConversationBuyerView | ConversationSellerView) =>
    role === "BUYER" ? c.buyerUnread : c.sellerUnread;

  return (
    <div className="flex h-full min-h-0 flex-col border-r bg-card">
      <div className="shrink-0 space-y-2 border-b p-3">
        <Input
          placeholder="Search conversations..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="h-9"
        />
        {role === "BUYER" && (
          <Button type="button" size="sm" className="w-full" onClick={() => setNewOpen(true)}>
            New message
          </Button>
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center text-sm text-muted-foreground">
            <MessageSquare className="h-10 w-10 opacity-40" />
            <p>No conversations yet</p>
            {role === "BUYER" && <p>Message a seller to get started</p>}
          </div>
        ) : (
          <ul className="divide-y">
            {filtered.map((c) => {
              const u = unread(c);
              const active = selectedId === c.id;
              const lastAt = c.lastMessageAt ?? c.updatedAt;
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(c.id)}
                    className={cn(
                      "flex w-full gap-3 px-3 py-3 text-left transition-colors hover:bg-accent/50",
                      active && "border-l-4 border-primary bg-primary/10"
                    )}
                  >
                    {role === "BUYER" ? (
                      <Image
                        src={(c as ConversationBuyerView).store.logo}
                        alt=""
                        width={44}
                        height={44}
                        className="h-11 w-11 shrink-0 rounded-full object-cover"
                      />
                    ) : (c as ConversationSellerView).buyer.image_url ? (
                      <Image
                        src={(c as ConversationSellerView).buyer.image_url!}
                        alt=""
                        width={44}
                        height={44}
                        className="h-11 w-11 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                        {(c as ConversationSellerView).buyer.name.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <span className="truncate font-medium text-foreground">
                          {role === "BUYER"
                            ? (c as ConversationBuyerView).store.name
                            : (c as ConversationSellerView).buyer.name}
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {formatListTime(lastAt)}
                        </span>
                      </div>
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                        {c.lastMessage ?? "No messages yet"}
                      </p>
                      {c.product && (
                        <Badge variant="secondary" className="mt-1 max-w-full truncate text-[10px]">
                          {c.product.name}
                        </Badge>
                      )}
                    </div>
                    {u > 0 && (
                      <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                        {u > 99 ? "99+" : u}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <NewMessageDialog open={newOpen} onOpenChange={setNewOpen} />
    </div>
  );
}
