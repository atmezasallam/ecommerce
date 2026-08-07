"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { toggleWishlist } from "@/src/app/actions/wishlist.actions";
import { Button } from "@/src/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { cn } from "@/src/lib/utils";

type AddToWishlistButtonProps = {
  productId: string;
  variantId: string;
  className?: string;
  showLabel?: boolean;
  initialState?: boolean;
};

export default function AddToWishlistButton({
  productId,
  variantId,
  className,
  showLabel = false,
  initialState = false,
}: AddToWishlistButtonProps) {
  const [saved, setSaved] = useState(initialState);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setSaved(initialState);
  }, [initialState, variantId]);

  const onClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const prev = saved;
      setSaved(!prev);
      startTransition(async () => {
        try {
          const res = await toggleWishlist(productId, variantId);
          if (!res.success) {
            setSaved(prev);
            toast.error(res.message);
            return;
          }
          setSaved(res.added);
          toast.success(res.added ? "Added to wishlist ♡" : "Removed from wishlist");
        } catch {
          setSaved(prev);
          toast.error("Could not update wishlist. Try again.");
        }
      });
    },
    [productId, variantId, saved]
  );

  const icon = isPending ? (
    <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
  ) : (
    <Heart
      className={cn("h-5 w-5 transition-colors", saved ? "fill-[#95CFB2] text-[#95CFB2]" : "")}
      aria-hidden
    />
  );

  const button = (
    <Button
      type="button"
      variant="ghost"
      size={showLabel ? "sm" : "icon"}
      className={cn(
        "shrink-0",
        !saved && "hover:text-[#95CFB2]",
        saved && "text-[#95CFB2]",
        className
      )}
      disabled={isPending}
      onClick={onClick}
      aria-pressed={saved}
      aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
    >
      {icon}
      {showLabel && <span className="ml-1">{saved ? "Saved" : "Save"}</span>}
    </Button>
  );

  if (saved && !showLabel) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent side="bottom">Remove from wishlist</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
}
