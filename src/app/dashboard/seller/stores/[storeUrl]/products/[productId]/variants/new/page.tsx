// Product Details form
import ProductDetails from "@/src/components/dashboard/forms/product-details";
import { db } from "@/src/lib/db";

// Queries
import { getAllCategories } from "@/src/queries/category";
import { getProductMainInfo } from "@/src/queries/product";

export default async function SellerNewProductVariantPage({
  params,
}: {
  params: { storeUrl: string; productId: string };
}) {
  const categories = await getAllCategories();
  const product = await getProductMainInfo(params.productId);
  if (!product) return null;
 
  return (
    <div>
      <ProductDetails
        categories={categories}
        storeUrl={params.storeUrl}
        data={product}
        
      />
    </div>
  );
}