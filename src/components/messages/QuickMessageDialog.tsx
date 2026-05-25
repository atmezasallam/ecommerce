"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { startConversation } from "@/src/app/actions/message.actions";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Textarea } from "@/src/components/ui/textarea";
import { cn } from "@/src/lib/utils";

const CHIPS = [
  "Is this item available?",
  "What are the shipping options?",
  "Do you offer bulk discounts?",
  "What's the return policy?",
];

type QuickMessageDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storeId: string;
  storeName: string;
  storeLogo: string;
  productId?: string;
  productName?: string;
  productImageUrl?: string;
};

export default function QuickMessageDialog({
  open,
  onOpenChange,
  storeId,
  productId,
  storeName,
  productName,
  storeLogo,
  productImageUrl,
}: QuickMessageDialogProps) {
  const [text, setText] = useState("");
  const [successId, setSuccessId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const reset = () => {
    setText("");
    setSuccessId(null);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const send = () => {
    const trimmed = text.trim();
    if (trimmed.length < 10) {
      toast.error("Please write at least 10 characters.");
      return;
    }
    startTransition(async () => {
      const res = await startConversation(storeId, trimmed, productId ?? undefined);
      if (res.success && res.conversationId) {
        setSuccessId(res.conversationId);
        toast.success("Message sent!");
      } else {
        toast.error(res.message ?? "Could not send message.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {successId ? (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <CheckCircle2 className="h-14 w-14 text-green-600 dark:text-green-400" />
            <div>
              <p className="font-semibold text-foreground">Message sent to {storeName}!</p>
              <p className="mt-1 text-sm text-muted-foreground">
                The seller will get back to you in your inbox.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <Button asChild>
                <Link href={`/profile/messages?conversationId=${successId}`}>View conversation</Link>
              </Button>
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <Image
                  src={storeLogo}
                  alt=""
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div>
                  <DialogTitle>Message {storeName}</DialogTitle>
                  <DialogDescription>Ask the seller a question</DialogDescription>
                </div>
              </div>
            </DialogHeader>
            {productId && productName ? (
              <div className="flex gap-3 rounded-lg bg-muted p-3 text-sm">
                {productImageUrl ? (
                  <Image
                    src={productImageUrl}
                    alt=""
                    width={56}
                    height={56}
                    className="h-14 w-14 shrink-0 rounded-md object-cover"
                  />
                ) : null}
                <div className="min-w-0">
                  <p className="font-medium text-foreground">Asking about this product</p>
                  <p className="mt-1 line-clamp-2 text-muted-foreground">{productName}</p>
                </div>
              </div>
            ) : null}
            <div className="flex flex-wrap gap-2">
              {CHIPS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="rounded-full border bg-background px-3 py-1 text-xs text-foreground transition-colors hover:bg-accent"
                  onClick={() => setText(c)}
                >
                  {c}
                </button>
              ))}
            </div>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, 1000))}
              placeholder="Write your message..."
              rows={4}
              className="min-h-[100px] resize-none"
            />
            <p className="text-right text-xs text-muted-foreground">{text.length}/1000</p>
            <Button type="button" className="w-full" disabled={pending} onClick={send}>
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send message"}
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
