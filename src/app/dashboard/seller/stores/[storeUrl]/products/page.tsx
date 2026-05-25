// Queries
import { getAllStoreProducts } from "@/src/queries/product";
import DataTable from "@/src/components/ui/data-table";
import { columns } from "./columns";


export default async function SellerProductsPage({
  params,
}: {
  params: { storeUrl: string };
}) {
  // Fetching products data from the database for the active store
  const products = await getAllStoreProducts(params.storeUrl);

  return (
    <DataTable
      newTabLink={`/dashboard/seller/stores/${params.storeUrl}/products/new`}
      filterValue="name"
      data={products}
      columns={columns}
      searchPlaceholder="Search product name..."
    />
  );
}