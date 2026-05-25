"use client";

import { useEffect, useState } from "react";

const GUEST_CART_COOKIE = "guest_cart";

const getGuestCount = (): number => {
  if (typeof document === "undefined") return 0;
  const match = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${GUEST_CART_COOKIE}=`));
  if (!match) return 0;

  try {
    const raw = decodeURIComponent(match.split("=").slice(1).join("="));
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
};

export default function CartBadgeClient() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(getGuestCount());
  }, []);

  if (count === 0) return null;

  return (
    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1.5 text-xs font-bold text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}
