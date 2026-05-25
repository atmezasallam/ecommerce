import { getBecomeSellerPageData } from "@/src/app/actions/user.actions";
import { getRequestOrigin } from "@/src/lib/request-origin";
import { BecomeSellerClient } from "./become-seller-client";

export default async function BecomeASellerPage() {
  const { store, categories } = await getBecomeSellerPageData();
  const becomeSellerPageAbsoluteUrl = `${getRequestOrigin()}/become-a-seller`;
  return (
    <BecomeSellerClient
      initialStore={store}
      categories={categories}
      becomeSellerPageAbsoluteUrl={becomeSellerPageAbsoluteUrl}
    />
  );
}
