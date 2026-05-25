import CartBadgeClient from "@/src/components/cart/CartBadgeClient";

type CartBadgeProps = {
  count?: number;
};

export default function CartBadge({ count }: CartBadgeProps) {
  if (typeof count === "number") {
    if (count === 0) return null;
    return (
      <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1.5 text-xs font-bold text-white">
        {count > 99 ? "99+" : count}
      </span>
    );
  }

  return <CartBadgeClient />;
}

export { CartBadgeClient };
