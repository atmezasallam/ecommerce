"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { Heart } from "lucide-react";

import { Button } from "@/src/components/ui/button";

const MotionSpan = dynamic(
  () => import("framer-motion").then((m) => m.motion.span),
  { ssr: false }
);

const floatHearts = [
  { x: "12%", delay: 0, duration: 10 },
  { x: "78%", delay: 1.2, duration: 12 },
  { x: "44%", delay: 2.5, duration: 11 },
  { x: "62%", delay: 0.8, duration: 13 },
];

export default function WishlistEmptyState() {
  return (
    <div className="relative flex min-h-[420px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed bg-muted/30 px-6 py-16 text-center">
      {floatHearts.map((h, i) => (
        <MotionSpan
          key={i}
          className="pointer-events-none absolute bottom-0 text-muted-foreground/25"
          style={{ left: h.x }}
          initial={{ y: 0, opacity: 0.4 }}
          animate={{ y: -320, opacity: 0 }}
          transition={{
            duration: h.duration,
            delay: h.delay,
            repeat: Infinity,
            ease: "linear",
          }}
          aria-hidden
        >
          <Heart className="h-8 w-8 fill-current" />
        </MotionSpan>
      ))}
      <Heart className="relative z-[1] mb-6 h-20 w-20 text-muted-foreground/40" strokeWidth={1} />
      <h2 className="relative z-[1] text-2xl font-semibold tracking-tight text-foreground">
        Your wishlist is empty
      </h2>
      <p className="relative z-[1] mt-2 max-w-md text-sm text-muted-foreground">
        Save items you love by clicking the heart on any product.
      </p>
      <div className="relative z-[1] mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link href="/">Start Shopping</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/cart">View Your Cart</Link>
        </Button>
      </div>
    </div>
  );
}
