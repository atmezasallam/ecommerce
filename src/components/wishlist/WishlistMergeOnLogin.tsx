"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";

export default function WishlistMergeOnLogin() {
  const { isSignedIn } = useUser();
  const hasMerged = useRef(false);

  useEffect(() => {
    if (!isSignedIn || hasMerged.current) return;

    const hasGuestWishlist = document.cookie.includes("guest_wishlist");
    if (!hasGuestWishlist) return;

    hasMerged.current = true;
    fetch("/api/wishlist/merge", { method: "POST" })
      .then(() => console.log("Wishlist merged"))
      .catch(console.error);
  }, [isSignedIn]);

  return null;
}
