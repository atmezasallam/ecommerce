/** Offer tags that should open a sort browse page instead of filtering by offerTagId. */
const OFFER_TAG_SORT_LINKS: Record<string, string> = {
  "top-rated": "top-rated",
};

export function getOfferTagBrowseHref(offerTagUrl: string): string {
  const sort = OFFER_TAG_SORT_LINKS[offerTagUrl];
  if (sort) return `/browse?sort=${sort}`;
  return `/browse?offer=${offerTagUrl}`;
}

export function isOfferTagBrowseActive(
  offerTagUrl: string,
  params: { offer?: string | null; sort?: string | null }
): boolean {
  const sort = OFFER_TAG_SORT_LINKS[offerTagUrl];
  if (sort) return params.sort === sort;
  return params.offer === offerTagUrl;
}
