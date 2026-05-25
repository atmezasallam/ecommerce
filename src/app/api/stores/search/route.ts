import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { StoreStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  if (q.length < 1) {
    return NextResponse.json([]);
  }

  const stores = await prisma.store.findMany({
    where: {
      status: StoreStatus.ACTIVE,
      name: { contains: q },
    },
    select: { id: true, name: true, logo: true, url: true },
    take: 5,
  });

  return NextResponse.json(stores);
}
