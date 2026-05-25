import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { getWishlist } from "@/src/app/actions/wishlist.actions";
import WishlistView from "@/src/components/wishlist/WishlistView";
import { getRequestOrigin } from "@/src/lib/request-origin";
import { computeWishlistStats } from "@/src/lib/wishlist-stats";

export default async function ProfileWishlistPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const data = await getWishlist();
  const stats = computeWishlistStats(data.items);
  const siteUrl = getRequestOrigin();

  return (
    <WishlistView
      initialItems={data.items}
      shareUserId={data.shareToken}
      siteUrl={siteUrl}
      stats={stats}
    />
  );
}
