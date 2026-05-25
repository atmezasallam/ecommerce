import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { storeId: string } }
) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  const { storeId } = params;

  if (!storeId) {
    return NextResponse.json([], { status: 400 });
  }

  const products = await prisma.product.findMany({
    where: {
      storeId,
      isArchived: false,
      ...(q.length > 0 ? { name: { contains: q } } : {}),
    },
    select: { id: true, name: true, slug: true },
    take: 8,
    orderBy: { name: "asc" },
  });

  return NextResponse.json(products);
}
