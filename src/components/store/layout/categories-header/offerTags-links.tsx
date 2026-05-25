"use client";
import { cn } from "@/src/lib/utils";
import { OfferTag } from "@prisma/client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function OfferTagsLinks({
  offerTags,
  open,
}: {
  offerTags: OfferTag[];
  open: boolean;
}) {
  const [splitPoint, setSplitPoint] = useState(6); // Default to large screen
  const searchParams = useSearchParams();
  const activeOffer = searchParams.get("offer");

  useEffect(() => {
    // Handle media queries on client side only to avoid hydration issues
    const updateSplitPoint = () => {
      const width = window.innerWidth;
      if (width >= 1536) setSplitPoint(7); // 2xl
      else if (width >= 1024) setSplitPoint(6); // lg
      else if (width >= 768) setSplitPoint(4); // md
      else if (width >= 640) setSplitPoint(3); // sm
      else setSplitPoint(2); // mobile
    };

    // Set initial value
    updateSplitPoint();

    // Listen for resize events
    window.addEventListener("resize", updateSplitPoint);
    return () => window.removeEventListener("resize", updateSplitPoint);
  }, []);
  
  // Safety check: if no offer tags, return null
  if (!offerTags || offerTags.length === 0) {
    return null;
  }
  return (
    <div className="relative w-full overflow-x-auto scrollbar">
      <div className="flex min-w-max items-center gap-2">
        {offerTags.slice(0, splitPoint).map((tag, i) => {
          const isActive = activeOffer === tag.url || (i === 0 && !activeOffer);
          return (
            <Link
              key={tag.id}
              href={`/browse?offer=${tag.url}`}
              className={cn(
                "whitespace-nowrap rounded-2xl border px-5 py-2 text-sm font-semibold tracking-tight transition-all duration-300 ease-out",
                "backdrop-blur-sm",
                {
                  "border-black/70 bg-gradient-to-r from-black/45 to-black/30 text-white shadow-[0_10px_24px_-12px_rgba(0,0,0,0.7)] ring-1 ring-white/20":
                    isActive,
                  "border-white/30 bg-white/15 text-white/95 hover:-translate-y-0.5 hover:scale-[1.02] hover:border-white/60 hover:bg-white/25 hover:text-white hover:shadow-[0_10px_24px_-14px_rgba(0,0,0,0.55)]":
                    !isActive,
                }
              )}
            >
              {tag.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

