"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  CheckCheck,
  ChevronLeft,
  Loader2,
  MoreHorizontal,
  Send,
  Store as StoreIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

import type { Message } from "@prisma/client";
import type { ConversationBuyerView, ConversationSellerView } from "@/types/message.types";
import {
  deleteConversation,
  getMessages,
  listMessagesForPolling,
  sendMessage,
} from "@/src/app/actions/message.actions";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Textarea } from "@/src/components/ui/textarea";
import { formatDayDivider, formatMessageTime } from "@/src/lib/message-date";
import { cn } from "@/src/lib/utils";

type MessageThreadProps = {
  conversationId: string;
  role: "BUYER" | "SELLER";
  conversation: ConversationBuyerView | ConversationSellerView;
  onDeleted: () => void;
  onBack?: () => void;
  showBack?: boolean;
};

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function MessageThread({
  conversationId,
  role,
  conversation,
  onDeleted,
  onBack,
  showBack,
}: MessageThreadProps) {
  const { user } = useUser();
  const uid = user?.id ?? "";
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [pending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isBuyer = role === "BUYER";
  const sellerConversation = conversation as ConversationSellerView;
  const title = isBuyer ? conversation.store.name : sellerConversation.buyer.name;
  const subtitle = `${conversation.store.defaultDeliveryTimeMin}–${conversation.store.defaultDeliveryTimeMax} business days delivery`;

  const loadFull = useCallback(() => {
    void getMessages(conversationId).then(setMessages);
  }, [conversationId]);

  useEffect(() => {
    loadFull();
  }, [loadFull]);

  useEffect(() => {
    const t = window.setInterval(() => {
      void listMessagesForPolling(conversationId).then(setMessages);
    }, 4000);
    return () => window.clearInterval(t);
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;
    if (text.length > 1000) {
      toast.error("Message too long.");
      return;
    }
    const optimistic: Message = {
      id: `temp-${Date.now()}`,
      conversationId,
      senderId: uid || "pending",
      senderRole: role,
      content: text,
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setMessages((m) => [...m, optimistic]);
    setDraft("");
    startTransition(async () => {
      const res = await sendMessage(conversationId, text);
      if (!res.success) {
        setMessages((m) => m.filter((x) => x.id !== optimistic.id));
        toast.error(res.message ?? "Failed to send");
        return;
      }
      if (res.data) {
        setMessages((m) => m.map((x) => (x.id === optimistic.id ? res.data! : x)));
      } else {
        loadFull();
      }
    });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const onDelete = () => {
    startTransition(async () => {
      const res = await deleteConversation(conversationId);
      if (res.success) {
        toast.success("Conversation deleted");
        onDeleted();
      } else {
        toast.error(res.message ?? "Could not delete");
      }
    });
  };

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-background">
      <header className="flex shrink-0 items-center gap-3 border-b px-3 py-2">
        {showBack && (
          <Button type="button" variant="ghost" size="icon" className="shrink-0 lg:hidden" onClick={onBack}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
        {isBuyer ? (
          <Image
            src={conversation.store.logo}
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : sellerConversation.buyer.image_url ? (
          <Image
            src={sellerConversation.buyer.image_url}
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-semibold">
            {sellerConversation.buyer.name.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="truncate font-semibold text-foreground">{title}</h2>
            <span
              className="hidden h-2 w-2 shrink-0 rounded-full bg-green-500 sm:inline-block"
              title="Live updates"
              aria-hidden
            />
          </div>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
          <p className="text-xs text-muted-foreground">
            {isBuyer
              ? `${conversation.store.name} typically replies within a few hours`
              : `${sellerConversation.buyer.name} is waiting for your reply`}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="icon">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/store/${conversation.store.url}`}>
                <StoreIcon className="mr-2 h-4 w-4" />
                View store
              </Link>
            </DropdownMenuItem>
            {conversation.product && (
              <DropdownMenuItem asChild>
                <Link href={`/product/${conversation.product.slug}`}>View product</Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem className="text-destructive" onClick={onDelete}>
              Delete conversation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {conversation.product && (
        <div className="shrink-0 border-b p-3">
          <Link
            href={`/product/${conversation.product.slug}`}
            className="flex items-center gap-2 rounded-lg bg-muted p-2 text-sm hover:bg-muted/80"
          >
            <span className="font-medium text-foreground">{conversation.product.name}</span>
            <span className="text-xs text-muted-foreground">· Product context</span>
          </Link>
        </div>
      )}

      <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => {
            const prev = messages[idx - 1];
            const d = new Date(msg.createdAt);
            const showDivider = !prev || !sameDay(new Date(prev.createdAt), d);
            const sentByMe = msg.id.startsWith("temp-") || msg.senderId === uid;

            return (
              <div key={msg.id}>
                {showDivider && (
                  <div className="my-4 flex justify-center">
                    <span className="rounded-full bg-muted px-3 py-0.5 text-xs text-muted-foreground">
                      {formatDayDivider(d)}
                    </span>
                  </div>
                )}
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex", sentByMe ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[70%] rounded-2xl px-3 py-2 text-sm",
                      sentByMe
                        ? "rounded-br-sm bg-primary text-primary-foreground"
                        : "rounded-bl-sm bg-muted text-foreground"
                    )}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    <div
                      className={cn(
                        "mt-1 flex items-center justify-end gap-1 text-[10px] opacity-80",
                        sentByMe ? "text-primary-foreground/90" : "text-muted-foreground"
                      )}
                    >
                      <span>{formatMessageTime(new Date(msg.createdAt))}</span>
                      {sentByMe && (
                        <span className="inline-flex">
                          {msg.isRead ? (
                            <CheckCheck className="h-3.5 w-3.5" />
                          ) : (
                            <Check className="h-3.5 w-3.5" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      <div className="shrink-0 border-t bg-card p-3">
        {draft.length > 500 && (
          <p className="mb-1 text-right text-xs text-amber-600 dark:text-amber-400">{draft.length}/1000</p>
        )}
        <div className="flex gap-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value.slice(0, 1000))}
            onKeyDown={onKeyDown}
            placeholder="Type a message..."
            rows={Math.min(4, Math.max(1, draft.split("\n").length))}
            className="min-h-[44px] max-h-32 resize-none"
            disabled={pending}
          />
          <Button
            type="button"
            size="icon"
            className="h-11 w-11 shrink-0"
            disabled={pending || !draft.trim()}
            onClick={handleSend}
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        <p className="mt-1 text-center text-[10px] text-muted-foreground">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
