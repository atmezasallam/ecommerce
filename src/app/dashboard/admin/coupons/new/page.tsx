import AdminCouponDetails from "@/src/components/dashboard/forms/admin-coupon-details";
import { getCouponByIdForAdmin, getStoresForAdminCoupon } from "@/src/queries/coupon";

type PageProps = {
  searchParams: { id?: string };
};

export default async function AdminCouponNewPage({ searchParams }: PageProps) {
  const couponId = searchParams.id;
  const [stores, coupon] = await Promise.all([
    getStoresForAdminCoupon(),
    couponId ? getCouponByIdForAdmin(couponId) : Promise.resolve(null),
  ]);

  if (couponId && !coupon) {
    return (
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">Coupon not found</h2>
        <p className="text-muted-foreground">Check the link or return to the coupons list.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">{couponId ? "Edit coupon" : "Create coupon"}</h2>
      <AdminCouponDetails stores={stores} coupon={coupon ?? undefined} />
    </div>
  );
}
