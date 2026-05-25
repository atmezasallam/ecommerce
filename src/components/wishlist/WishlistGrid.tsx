"use client";

import { AnimatePresence, motion } from "framer-motion";

import type { WishlistItemFull } from "@/types/wishlist.types";
import WishlistCard from "@/src/components/wishlist/WishlistCard";

type WishlistGridProps = {
  items: WishlistItemFull[];
  onRemoved: (id: string) => void;
};

export default function WishlistGrid({ items, onRemoved }: WishlistGridProps) {
  return (
    <motion.div
      className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4"
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: {
          transition: { staggerChildren: 0.05 },
        },
      }}
    >
      <AnimatePresence mode="popLayout">
        {items.map((item) => (
          <motion.div
            key={item.id}
            layout
            variants={{
              hidden: { opacity: 0, y: 8 },
              show: { opacity: 1, y: 0 },
            }}
          >
            <WishlistCard item={item} onRemoved={onRemoved} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
