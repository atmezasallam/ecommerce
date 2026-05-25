import Link from "next/link";
import { Heart } from "lucide-react";
import WishlistBadge from "@/src/components/wishlist/WishlistBadge";

type WishlistHeaderLinkProps = {
  count: number;
};

export default function WishlistHeaderLink({ count }: WishlistHeaderLinkProps) {
  return (
    <div className="relative flex h-11 items-center px-2">
      <Link href="/profile/wishlist" className="flex items-center text-white/80 hover:text-white" aria-label="Wishlist">
        <span className="relative inline-flex text-[28px] leading-none">
          <Heart className="h-7 w-7 fill-none stroke-[2]" stroke="currentColor" />
          <span className="absolute -right-1 -top-1">
            <WishlistBadge count={count} />
          </span>
        </span>
        <b className="ml-1 hidden text-xs font-bold leading-4 sm:inline">Wishlist</b>
      </Link>
    </div>
  );
}
