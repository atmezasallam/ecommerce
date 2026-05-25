"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";

export default function CartMergeOnLogin() {
  const { isSignedIn } = useUser();
  const hasMerged = useRef(false);

  useEffect(() => {
    if (!isSignedIn || hasMerged.current) return;

    const hasGuestCart = document.cookie.includes("guest_cart");
    if (!hasGuestCart) return;

    hasMerged.current = true;
    fetch("/api/cart/merge", { method: "POST" })
      .then(() => console.log("Cart merged"))
      .catch(console.error);
  }, [isSignedIn]);

  return null;
}
