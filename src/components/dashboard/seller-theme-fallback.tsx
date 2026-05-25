"use client";

import { usePathname } from "next/navigation";
import ThemeToggle from "@/src/components/ui/theme-toggle";

/**
 * Seller routes under /stores/[storeUrl]/… already show ThemeToggle in the top header.
 * This covers /dashboard/seller/stores and /dashboard/seller/stores/new (no header).
 */
export default function SellerThemeFallback() {
  const pathname = usePathname() ?? "";
  const hasStoreHeader =
    /^\/dashboard\/seller\/stores\/(?!new$)[^/]+/.test(pathname);
  if (hasStoreHeader) return null;
  return (
    <div className="fixed right-4 top-4 z-[100]">
      <ThemeToggle />
    </div>
  );
}
