import Link from "next/link";
import { redirect } from "next/navigation";

import ProductList from "@/src/components/store/shared/product-list";
import { getProducts } from "@/src/queries/product";

type BrowsePageProps = {
  searchParams: {
    search?: string;
    category?: string;
    subCategory?: string;
    offer?: string;
    sort?: string;
    page?: string;
  };
};

function buildPageHref(
  searchParams: BrowsePageProps["searchParams"],
  page: number
) {
  const params = new URLSearchParams();

  if (searchParams.search) params.set("search", searchParams.search);
  if (searchParams.category) params.set("category", searchParams.category);
  if (searchParams.subCategory) params.set("subCategory", searchParams.subCategory);
  if (searchParams.offer) params.set("offer", searchParams.offer);
  if (searchParams.sort) params.set("sort", searchParams.sort);
  if (page > 1) params.set("page", String(page));

  const query = params.toString();
  return query ? `/browse?${query}` : "/browse";
}

function getBrowseTitle(searchParams: BrowsePageProps["searchParams"]) {
  if (searchParams.search) {
    return `Results for "${searchParams.search}"`;
  }
  if (searchParams.subCategory) return "Subcategory";
  if (searchParams.category) return "Category";
  if (searchParams.offer) return "Offers";
  if (searchParams.sort === "new-arrivals") return "New arrivals";
  if (searchParams.sort === "top-rated") return "Top rated";
  return "All products";
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  if (searchParams.offer === "top-rated" && !searchParams.sort) {
    redirect("/browse?sort=top-rated");
  }

  const currentPage = Math.max(1, Number.parseInt(searchParams.page ?? "1", 10) || 1);

  const filters: Record<string, string> = {};
  if (searchParams.search) filters.search = searchParams.search;
  if (searchParams.category) filters.category = searchParams.category;
  if (searchParams.subCategory) filters.subCategory = searchParams.subCategory;
  if (searchParams.offer) filters.offer = searchParams.offer;

  const { products, totalPages, totalCount } = await getProducts(
    filters,
    searchParams.sort ?? "",
    currentPage,
    24
  );

  const title = getBrowseTitle(searchParams);

  return (
    <main className="px-4 py-8 md:px-8 lg:px-12">
      <h1 className="text-2xl font-bold text-main-primary">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {totalCount} {totalCount === 1 ? "product" : "products"}
      </p>

      <div className="mt-6">
        <ProductList products={products} />
      </div>

      {totalPages > 1 ? (
        <nav
          className="mt-8 flex items-center justify-center gap-4 border-t border-border pt-6"
          aria-label="Pagination"
        >
          {currentPage > 1 ? (
            <Link
              href={buildPageHref(searchParams, currentPage - 1)}
              className="text-sm font-medium text-subtle hover:text-[#2d6b54]"
            >
              Previous
            </Link>
          ) : (
            <span className="text-sm text-muted-foreground">Previous</span>
          )}
          <span className="text-sm text-main-primary">
            Page {currentPage} of {totalPages}
          </span>
          {currentPage < totalPages ? (
            <Link
              href={buildPageHref(searchParams, currentPage + 1)}
              className="text-sm font-medium text-subtle hover:text-[#2d6b54]"
            >
              Next
            </Link>
          ) : (
            <span className="text-sm text-muted-foreground">Next</span>
          )}
        </nav>
      ) : null}
    </main>
  );
}
