import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import DataTable from "@/src/components/ui/data-table";
import AddCouponForm from "@/src/components/dashboard/seller/coupons/add-coupon-form";
import { getSellerCouponsForStore } from "@/src/queries/coupon";

import { couponColumns, type SellerCouponRow } from "./columns";

export default async function SellerStoreCouponsPage({
  params,
}: {
  params: { storeUrl: string };
}) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }

  const coupons = await getSellerCouponsForStore(params.storeUrl, userId);
  if (coupons === null) {
    redirect("/dashboard/seller/stores");
  }

  const data: SellerCouponRow[] = coupons.map((c) => ({
    id: c.id,
    code: c.code,
    name: c.name,
    discount: c.discount,
    isActive: c.isActive,
    startDate: c.startDate.toISOString(),
    endDate: c.endDate.toISOString(),
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Coupons</h1>
        <p className="text-muted-foreground">
          Create discount codes for <span className="font-medium text-foreground">{params.storeUrl}</span>.
        </p>
      </div>

      <AddCouponForm storeUrl={params.storeUrl} />

      <DataTable
        columns={couponColumns}
        data={data}
        filterValue="code"
        searchPlaceholder="Search by code..."
      />
    </div>
  );
}
