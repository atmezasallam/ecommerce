"use server";

import { unstable_cache } from "next/cache";
import { db } from "@/src/lib/db";
import { getProductCardImages } from "@/src/lib/product-card-images";

type HomeSort = "sales" | "rating" | "createdAt";

async function getHomepageProducts(sortBy: HomeSort) {
  const products = await db.product.findMany({
    where: { isArchived: false },
    select: {
      id: true,
      name: true,
      slug: true,
      brand: true,
      rating: true,
      numReviews: true,
      sales: true,
      store: {
        select: {
          id: true,
          name: true,
          url: true,
        },
      },
      variants: {
        take: 1,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          variantName: true,
          variantImage: true,
          slug: true,
          isSale: true,
          saleEndDate: true,
          images: {
            take: 1,
            select: {
              id: true,
              url: true,
              productVariantId: true,
            },
          },
          sizes: {
            take: 1,
            orderBy: { price: "asc" },
            select: {
              id: true,
              size: true,
              price: true,
              discount: true,
              quantity: true,
              productVariantId: true,
            },
          },
          colors: {
            select: { id: true, name: true },
          },
        },
      },
    },
    orderBy: { [sortBy]: "desc" },
    take: 12,
  });

  const mapped = products.map((product) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    rating: product.rating,
    sales: product.sales,
    numReviews: product.numReviews,
    variants: product.variants.map((variant) => ({
      variantId: variant.id,
      variantSlug: variant.slug,
      variantName: variant.variantName,
      images: getProductCardImages(variant),
      sizes: variant.sizes,
    })),
    variantImages: product.variants.map((variant) => ({
      url: `/product/${product.slug}/${variant.slug}`,
      image: variant.variantImage || variant.images[0]?.url || "",
    })),
  }));

  return {
    products: mapped,
    totalPages: 1,
    currentPage: 1,
    pageSize: 12,
    totalCount: mapped.length,
  };
}

export const getFeaturedProducts = unstable_cache(
  async () => getHomepageProducts("sales"),
  ["homepage-featured-products"],
  { revalidate: 300 }
);

export const getTopRated = unstable_cache(
  async () => getHomepageProducts("rating"),
  ["homepage-top-rated-products"],
  { revalidate: 300 }
);

export const getNewArrivals = unstable_cache(
  async () => getHomepageProducts("createdAt"),
  ["homepage-new-arrivals-products"],
  { revalidate: 300 }
);

export const getProductsByCategory = unstable_cache(
  async (categoryId: string) =>
    db.product.findMany({
      where: { isArchived: false, categoryId },
      select: {
        id: true,
        name: true,
        slug: true,
        rating: true,
        numReviews: true,
        sales: true,
      },
      orderBy: { sales: "desc" },
      take: 12,
    }),
  ["homepage-products-by-category"],
  { revalidate: 300 }
);
