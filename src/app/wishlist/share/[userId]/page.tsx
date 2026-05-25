import { notFound } from "next/navigation";

import { auth } from "@clerk/nextjs/server";

import { getPublicWishlistByUserId } from "@/src/app/actions/wishlist.actions";
import prisma from "@/lib/prisma";
import WishlistShareCard from "@/src/components/wishlist/WishlistShareCard";

interface PageProps {
  params: { userId: string };
}

export default async function PublicWishlistSharePage({ params }: PageProps) {
  const { userId } = params;
  if (!userId) {
    notFound();
  }

  const [user, items, viewer] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true },
    }),
    getPublicWishlistByUserId(userId),
    auth(),
  ]);

  if (!user) {
    notFound();
  }

  const viewerId = viewer.userId ?? null;
  let savedVariantIds = new Set<string>();
  if (viewerId) {
    const wl = await prisma.wishlist.findUnique({
      where: { userId: viewerId },
      include: { items: { select: { variantId: true } } },
    });
    savedVariantIds = new Set(wl?.items.map((i: { variantId: string }) => i.variantId) ?? []);
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-foreground">Wishlist</h1>
        <p className="mt-2 text-muted-foreground">
          This wishlist is empty or doesn&apos;t exist.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">
        {user.name}&apos;s Wishlist
        <span className="ml-2 text-lg font-normal text-muted-foreground">
          ({items.length} items)
        </span>
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Shared list — sign in to save items to your own wishlist.
      </p>
      <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <WishlistShareCard
            key={item.id}
            item={item}
            initialInWishlist={savedVariantIds.has(item.variantId)}
          />
        ))}
      </div>
    </div>
  );
}
