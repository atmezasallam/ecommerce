import DataTable from "@/src/components/ui/data-table";
import { getAllOfferTags } from "@/src/queries/offerTag";
import { columns } from "./columns";

import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { Plus } from "lucide-react";

export default async function AdminOfferTagsPage() {
  const offerTags = await getAllOfferTags();
  if (!offerTags) return null;

  return (
    <div className="space-y-4">
      {/* HEADER — Title + Create Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Offer Tags</h2>

        <Button asChild className="h-12 flex items-center gap-2">
          <Link href="/dashboard/admin/offer-tags/new">
            <Plus size={15} />
            Create Offer Tag
          </Link>
        </Button>
      </div>

      {/* TABLE */}
      <DataTable
        columns={columns}
        data={offerTags}
        filterValue="name"
        searchPlaceholder="Search offer tag name..."
      />
    </div>
  );
}

