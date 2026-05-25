import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { db } from "@/src/lib/db";
import { isPlatformAdmin } from "@/src/lib/admin-access";

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  const clerkRole = user.privateMetadata.role as string | undefined;

  if (isPlatformAdmin(dbUser?.role, clerkRole)) {
    redirect("/dashboard/admin");
  }

  const clerkSeller =
    typeof clerkRole === "string" && clerkRole.trim().toUpperCase() === "SELLER";
  if (clerkSeller || dbUser?.role === "SELLER") {
    redirect("/dashboard/seller");
  }

  redirect("/");
}




















/*import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";




export default async function DashboardPage() {
    //get user and redirect depanding on role
    const user=await currentUser();
if(!user?.privateMetadata?.role || user?.privateMetadata.role==="USER") redirect("/"); //mean ("/") homepage
    
if(user?.privateMetadata.role==="ADMIN ") redirect("/dashboard/admin");

if(user?.privateMetadata.role==="SELLER") redirect("/dashboard/seller");
    
}

*/