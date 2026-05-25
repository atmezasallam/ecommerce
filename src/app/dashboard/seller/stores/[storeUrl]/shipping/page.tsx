import StoreDefaultShippingDetails from "@/src/components/dashboard/forms/store-default-shipping-details";
import DataTable from "@/src/components/ui/data-table";
import {
  getStoreDefaultShippingDetails,
  getStoreShippingRates,
} from "@/src/queries/store";
import { redirect } from "next/navigation";
import { columns } from "./columns";


export default async function SellerStoreShippingPage({
  params,
}: {
  params: { storeUrl: string };
}) {
  const shippingDetails = await getStoreDefaultShippingDetails(params.storeUrl);
  if(!shippingDetails) redirect("/");
  const shippingRates = await getStoreShippingRates(params.storeUrl);
  return (
    <div>
      <StoreDefaultShippingDetails
        data={shippingDetails}
        storeUrl={params.storeUrl}
      />

<DataTable
        filterValue="countryName"
        data={shippingRates}
        columns={columns}
        searchPlaceholder="Search by country name..."
      />
      
    </div>
  );
}







