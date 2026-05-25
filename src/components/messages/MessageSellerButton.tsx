"use client";

import { useState } from "react";
import { MessageSquareMore } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import QuickMessageDialog from "@/src/components/messages/QuickMessageDialog";
import { cn } from "@/src/lib/utils";

type MessageSellerButtonProps = {
  storeId: string;
  storeName: string;
  storeLogo: string;
  productId?: string;
  productName?: string;
  productImageUrl?: string;
  className?: string;
};

export default function MessageSellerButton({
  storeId,
  productId,
  storeName,
  productName,
  storeLogo,
  productImageUrl,
  className,
}: MessageSellerButtonProps) {
  const [open, setOpen] = useState(false);
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  const onClick = () => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      toast.error("Please sign in to message sellers");
      router.push("/sign-in");
      return;
    }
    setOpen(true);
  };

  return (
    <>
      <button
        type="button"
        className={cn(
          "flex h-9 min-w-[110px] cursor-pointer items-center justify-center rounded-full border border-black bg-main-primary px-4 text-base font-bold text-white hover:opacity-90",
          className
        )}
        onClick={onClick}
      >
        <MessageSquareMore className="me-2 w-4" />
        <span>Message</span>
      </button>
      <QuickMessageDialog
        open={open}
        onOpenChange={setOpen}
        storeId={storeId}
        productId={productId}
        storeName={storeName}
        productName={productName}
        storeLogo={storeLogo}
        productImageUrl={productImageUrl}
      />
    </>
  );
}
