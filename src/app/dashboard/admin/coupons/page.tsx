import Link from "next/link";
import { Plus } from "lucide-react";

import DataTable from "@/src/components/ui/data-table";
import { Button } from "@/src/components/ui/button";
import { getAllCouponsForAdmin } from "@/src/queries/coupon";

import { columns } from "./columns";

export default async function AdminCouponsPage() {
  const coupons = await getAllCouponsForAdmin();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Coupons</h2>
        <Button asChild className="h-12 gap-2">
          <Link href="/dashboard/admin/coupons/new">
            <Plus size={15} />
            Create coupon
          </Link>
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={coupons}
        filterValue="code"
        searchPlaceholder="Search by coupon code..."
      />
    </div>
  );
}
