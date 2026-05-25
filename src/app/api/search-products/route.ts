import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import type { SearchResult } from "@/src/lib/types";

export async function GET(req: NextRequest) {
  const search = (req.nextUrl.searchParams.get("search") ?? "").trim();

  if (search.length < 2) {
    return NextResponse.json([]);
  }

  const products = await prisma.product.findMany({
    where: {
      isArchived: false,
      OR: [
        { name: { contains: search } },
        { description: { contains: search } },
        {
          variants: {
            some: {
              OR: [
                { variantName: { contains: search } },
                { variantDescription: { contains: search } },
              ],
            },
          },
        },
      ],
    },
    select: {
      name: true,
      slug: true,
      variants: {
        take: 1,
        orderBy: { createdAt: "asc" },
        select: {
          slug: true,
          variantImage: true,
          images: { take: 1, select: { url: true } },
        },
      },
    },
    take: 8,
    orderBy: { views: "desc" },
  });

  const results: SearchResult[] = products
    .filter((product) => product.variants.length > 0)
    .map((product) => {
      const variant = product.variants[0];
      return {
        name: product.name,
        image: variant.variantImage || variant.images[0]?.url || "",
        link: `/product/${product.slug}/${variant.slug}`,
      };
    });

  return NextResponse.json(results);
}
