import OfferTagDetails from "@/src/components/dashboard/forms/offer-tag-details";

type AdminNewOfferTagsPageProps = {
  searchParams: { id?: string };
};

export default async function AdminNewOfferTagsPage({
  searchParams,
}: AdminNewOfferTagsPageProps) {
  // If id is provided, we're editing; otherwise, we're creating
  const offerTagId = searchParams.id;

  // If editing, fetch the offer tag data
  let offerTagData = null;
  if (offerTagId) {
    const { getOfferTag } = await import("@/src/queries/offerTag");
    offerTagData = await getOfferTag(offerTagId);
  }

  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">
        {offerTagId ? "Edit Offer Tag" : "Create Offer Tag"}
      </h2>
      <OfferTagDetails data={offerTagData || undefined} />
    </div>
  );
}

