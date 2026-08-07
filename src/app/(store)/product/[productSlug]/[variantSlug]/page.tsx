import ProductPageContainer from "@/src/components/store/product-page/container";
import { Separator } from "@/src/components/ui/separator";
import { getProductPageData, getProducts } from "@/src/queries/product";
import { notFound, redirect } from "next/navigation";
import RelatedProducts from "@/src/components/store/product-page/related-product";
import ProductDescription from "@/src/components/store/product-page/product-description";
import ProductSpecs from "@/src/components/store/product-page/product-specs";
import ProductQuestions from "@/src/components/store/product-page/product-questions";
import StoreCard from "@/src/components/store/cards/store-card";
import StoreProducts from "@/src/components/store/product-page/store-products";
import ProductReviews from "@/src/components/store/product-page/reviews/product-reviews";
import { isInCart } from "@/src/app/actions/cart.actions";
import { isInWishlist } from "@/src/app/actions/wishlist.actions";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { productSlug: string; variantSlug: string };
  searchParams: {
    size?: string;
  };
}

export default async function ProductVariantPage({
  params: { productSlug, variantSlug },
  searchParams: { size: sizeId },
}: PageProps) {
  // Fetch product data based on the product slug and variant slug
  const productData = await getProductPageData(productSlug, variantSlug);

  // If no product data is found, show the 404 Not Found page
  if (!productData) {
    return notFound();
    //return redirect("/");
  }

  // Extract the available sizes for the product variant
  const { sizes } = productData;

  // If the size is provided in the URL
  if (sizeId) {
    // Check if the provided sizeId is valid by comparing with available sizes
    const isValidSize = sizes.some((size) => size.id === sizeId);

    // If the sizeId is not valid, redirect to the same product page without the size parameter
    if (!isValidSize) {
      return redirect(`/product/${productSlug}/${variantSlug}`);
    }
  }
  // Prefill first size so price + Add to cart work (multi-size products need ?size= in the URL)
  else if (sizes.length > 0) {
    return redirect(`/product/${productSlug}/${variantSlug}?size=${sizes[0].id}`);
  }

  const {
    productId,
    variantInfo,
    specs,
    questions,
    category,
    store,
    reviewsStatistics,
    reviews,
  } = productData;

  const relatedProducts = await getProducts(
    { category: category.url },
    "",
    1,
    12
  );

  const [initialInWishlist, initialInCart] = await Promise.all([
    isInWishlist(productData.variantId),
    sizeId
      ? isInCart(productData.variantId, sizeId)
      : Promise.resolve(false),
  ]);

  return (
    <div className="max-w-[1650px] mx-auto p-4 overflow-x-hidden">
        <ProductPageContainer
          productData={productData}
          sizeId={sizeId}
          initialInWishlist={initialInWishlist}
          initialInCart={initialInCart}
        />
        {relatedProducts.products && relatedProducts.products.length > 0 && (
          <>
            <Separator />
            <RelatedProducts products={relatedProducts.products} />
          </>
        )}
        <Separator className="mt-6" />
        <ProductReviews
          productId={productData.productId}
          rating={productData.rating}
          statistics={reviewsStatistics}
          reviews={reviews}
          variantsInfo={variantInfo}
        />
        <Separator className="mt-6" />
        <ProductDescription
          text={[
            productData.description,
            productData.variantDescription || "",
          ]}
        />
        {(specs.product.length > 0 || specs.variant.length > 0) && (
          <>
            <Separator className="mt-6" />
            <ProductSpecs specs={specs} />
          </>
        )}
        {questions.length > 0 && (
          <>
            <Separator className="mt-6" />
            <ProductQuestions questions={productData.questions} />
          </>
        )}
        <Separator className="my-6" />
        <StoreCard
          store={productData.store}
          productId={productData.productId}
          productName={productData.name}
          productImageUrl={
            productData.images?.[0]?.url ?? productData.variantImage ?? undefined
          }
        />
        <StoreProducts
          storeUrl={store.url}
          storeName={store.name}
          count={5}
        />
    </div>
  );
} 