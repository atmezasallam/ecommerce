import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { mergeGuestWishlistOnLogin } from "@/src/app/actions/wishlist.actions";

export async function POST() {
  try {
    const cookieStore = cookies();
    const guestWishlist = cookieStore.get("guest_wishlist");
    if (!guestWishlist?.value || guestWishlist.value === "[]") {
      return NextResponse.json({ success: true, skipped: true }, { status: 200 });
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    await mergeGuestWishlistOnLogin(userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Wishlist merge error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
