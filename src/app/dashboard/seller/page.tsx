//clerk
import { currentUser } from "@clerk/nextjs/server";
//next.js
import { redirect } from "next/navigation";
//DB
import { db } from "@/src/lib/db";


export default async function SellerDashboardPage() {
  // Fetch the current user from Clerk
  const authUser = await currentUser();
  if (!authUser) {
    redirect("/");
    return;
  }

  // Get the database user (same logic as upsertStore)
  const clerkEmail =
    authUser.emailAddresses?.[0]?.emailAddress ??
    authUser.primaryEmailAddress?.emailAddress ??
    "";

  let dbUser = await db.user.findUnique({
    where: { id: authUser.id },
  });

  if (!dbUser) {
    dbUser = await db.user.findUnique({
      where: { email: clerkEmail },
    });
  }

  if (!dbUser) {
    redirect("/dashboard/seller/stores/new");
    return;
  }

  // Retrieve the list of stores associated with the authenticated user
  const stores = await db.store.findMany({
    where: {
      userId: dbUser.id, // Use dbUser.id instead of authUser.id
    },
  });

//if the use5r has no stores, redirect him to the create store page
if(stores.length===0){
  redirect("/dashboard/seller/stores/new");
  return;
}



//if the user has stores, redirect him to the first store
redirect(`/dashboard/seller/stores/${stores[0].url}`);


return (
    <div>Seller dashboard</div>
);


}


