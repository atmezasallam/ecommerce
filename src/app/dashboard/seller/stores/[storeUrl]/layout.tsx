/*//react,next.js
import { ReactNode } from "react"

//custom ui components
import Sidebar from "@/src/components/ui/dashboard/sidebar/sidebar";
import  Header  from "@/src/components/ui/dashboard/header/header";

//clerk
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

//DB 
import { db } from "@/src/lib/db";

export default async function SellerStoreDashboardLayout({children}:{children:React.ReactNode}) {
    
    
    //fetch the current user.if the user isd not authenticated, redirect him to the home page
    const user=await currentUser();
    if(!user){
         redirect("/");
         return;//ensure no further code is executed
    }

// Retrieve the list of stores associated with the authentacted user.
  const stores =await db.store.findMany({
    where:{
        userId:user.id,
    }
  })  



    
    
    return( 
    <div className="h-full w-full flex">
     <Sidebar stores={stores}/>
     <div className="w-full ml-[300px]">
        <Header/>
        <div className="w-full mt-[75px] p-4">{children}</div>
     </div>
    </div>

    );   
}
*/


//react,next.js
import { ReactNode } from "react";

//custom ui components
import Sidebar from "@/src/components/dashboard/sidebar/sidebar";
import Header from "@/src/components/dashboard/header/header";

//clerk
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

//DB
import { db } from "@/src/lib/db";
import { getTotalUnreadCount } from "@/src/app/actions/message.actions";

export default async function SellerStoreDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { storeUrl: string };
}) {
  // 1) نجيب اليوزر من Clerk
  const authUser = await currentUser();
  if (!authUser) {
    redirect("/");
    return;
  }

  // 2) الإيميل من Clerk
  const clerkEmail =
    authUser.emailAddresses?.[0]?.emailAddress ??
    authUser.primaryEmailAddress?.emailAddress ??
    "";

  // 3) نلاقي نفس اليوزر الموجود في DB (نفس منطق upsert-store)
  let dbUser =
    (await db.user.findUnique({ where: { id: authUser.id } })) ||
    (await db.user.findUnique({ where: { email: clerkEmail } }));

  // 4) لو مش موجود → نرجّع المستخدم لصفحة المتاجر
  if (!dbUser) {
    redirect("/dashboard/seller/stores");
    return;
  }

  const clerkRole = authUser.privateMetadata?.role;
  const isAdmin = clerkRole === "ADMIN" || dbUser.role === "ADMIN";

  // 5) نجيب المتاجر + unread messages badge
  // ADMIN يشوف كل المتاجر, SELLER يشوف متاجره فقط.
  const [stores, messageUnreadCount] = await Promise.all([
    db.store.findMany({
      where: isAdmin ? undefined : { userId: dbUser.id },
    }),
    getTotalUnreadCount(),
  ]);

  // 6) Guard: if storeUrl is not visible for this user, redirect safely.
  const requestedStore = stores.find((s) => s.url === params.storeUrl);
  if (!requestedStore) {
    if (stores.length > 0) {
      redirect(`/dashboard/seller/stores/${stores[0].url}`);
      return;
    }
    redirect("/dashboard/seller/stores/new");
    return;
  }

  if (!isAdmin && requestedStore.status !== "ACTIVE") {
    redirect("/become-a-seller");
    return;
  }

  // (اختياري) لو حابة تتأكدي في الكونسول:
  // console.log("STORES IN LAYOUT:", stores);

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar stores={stores} messageUnreadCount={messageUnreadCount} />
      <div className="ml-[300px] flex min-h-screen min-w-0 flex-1 flex-col">
        <Header />
        <div className="w-full flex-1 p-4 pt-[75px]">{children}</div>
      </div>
    </div>
  );
}
