"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import {
  EmailShareButton,
  TelegramShareButton,
  TwitterShareButton,
  WhatsappShareButton,
} from "next-share";

import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";

type WishlistShareDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shareUrl: string;
  title: string;
};

export default function WishlistShareDialog({
  open,
  onOpenChange,
  shareUrl,
  title,
}: WishlistShareDialogProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const iconBtn =
    "inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-muted";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Your Wishlist</DialogTitle>
          <DialogDescription>
            Anyone with this link can view your wishlist (read-only).
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2">
          <div className="min-w-0 flex-1 truncate rounded-md border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
            {shareUrl}
          </div>
          <Button type="button" variant="secondary" size="icon" onClick={() => void copy()}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
        {copied && <p className="text-xs font-medium text-green-600 dark:text-green-400">Copied!</p>}
        <div>
          <p className="mb-2 text-sm font-medium text-foreground">Share via</p>
          <div className="flex flex-wrap gap-2">
            <WhatsappShareButton url={shareUrl} title={title} separator="::" className={iconBtn}>
              <span className="text-lg" aria-hidden>
                WA
              </span>
            </WhatsappShareButton>
            <TelegramShareButton url={shareUrl} title={title} className={iconBtn}>
              <span className="text-lg" aria-hidden>
                TG
              </span>
            </TelegramShareButton>
            <TwitterShareButton url={shareUrl} title={title} className={iconBtn}>
              <span className="text-lg" aria-hidden>
                X
              </span>
            </TwitterShareButton>
            <EmailShareButton url={shareUrl} subject={title} body={shareUrl} className={iconBtn}>
              <span className="text-lg" aria-hidden>
                @
              </span>
            </EmailShareButton>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Prices may vary at the time of purchase.
        </p>
      </DialogContent>
    </Dialog>
  );
}
