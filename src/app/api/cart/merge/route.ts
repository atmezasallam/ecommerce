import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { mergeGuestCartOnLogin } from "@/src/app/actions/cart.actions";

export async function POST() {
  try {
    const cookieStore = cookies();
    const guestCart = cookieStore.get("guest_cart");
    if (!guestCart?.value || guestCart.value === "[]") {
      return NextResponse.json({ success: true, skipped: true }, { status: 200 });
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    await mergeGuestCartOnLogin(userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cart merge error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
