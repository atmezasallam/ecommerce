import Link from "next/link";
import { CartIcon } from "@/src/components/store/icons";
import CartBadge from "@/src/components/cart/CartBadge";

type CartProps = {
  count?: number;
};

export default function Cart({ count }: CartProps) {
  return (
    <div className="relative flex h-11 items-center px-2 cursor-pointer">
      <Link href="/cart" className="flex items-center text-white/80 hover:text-white">
        <span className="text-[32px] inline-block">
          <CartIcon />
        </span>
        <div className="ml-1">
          <div className="relative -mt-1.5 mb-0.5">
            <CartBadge count={count} />
          </div>
          <b className="text-xs font-bold text-wrap leading-4">Cart</b>
        </div>
      </Link>
    </div>
  );
}