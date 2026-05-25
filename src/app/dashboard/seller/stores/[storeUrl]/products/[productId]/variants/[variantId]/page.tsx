import ProductDetails from "@/src/components/dashboard/forms/product-details";
import { getAllCategories } from "@/src/queries/category";
import { getProductVariant } from "@/src/queries/product";
import { redirect } from "next/navigation";

export default async function SellerEditProductVariantPage({
  params,
}: {
  params: { storeUrl: string; productId: string; variantId: string };
}) {
  const [categories, product] = await Promise.all([
    getAllCategories(),
    getProductVariant(params.productId, params.variantId),
  ]);

  if (!product) {
    redirect(`/dashboard/seller/stores/${params.storeUrl}/products`);
  }

  return (
    <div className="w-full">
      <ProductDetails
        categories={categories}
        storeUrl={params.storeUrl}
        data={product}
      />
    </div>
  );
}
