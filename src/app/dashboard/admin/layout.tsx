
/*
//Header
import Herader from "@/components/ui/dashboard/header/header";

//Sidebar
import { Sidebar } from "@/components/ui/sidebar";

//clerk
import { currentUser } from "@clerk/nextjs/server";

// React , next.js
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export default async function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await currentUser();
  const role = user?.privateMetadata?.role;

 if (!user || user?.privateMetadata?.role !== "ADMIN") redirect("/"); 


  return <div className="w-full h-full">
*/
{/*  sidebar */}/*

 <Sidebar/>
<div className="w-full ml-[300px]"></div>

*/
{/*header */}/*
<Herader/>
<div className="w-full mt-[75px] p-4">{children}</div>




  </div>;
}
*/


// Header
import Header from "@/src/components/dashboard/header/header";

// Sidebar + Provider (coming from your sidebar component)
import Sidebar from "@/src/components/dashboard/sidebar/sidebar";
import {SidebarProvider}  from "@/src/components/ui/sidebar";
// Clerk (server-side)
import { currentUser } from "@clerk/nextjs/server";

import { db } from "@/src/lib/db";
import { isPlatformAdmin } from "@/src/lib/admin-access";

// Next.js / React types
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

interface AdminDashboardLayoutProps {
  children: ReactNode;
}

// This is a Server Component layout for the admin dashboard
export default async function AdminDashboardLayout({
  children,
}: AdminDashboardLayoutProps) {
  const user = await currentUser();
  if (!user) {
    redirect("/");
  }

  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  if (!isPlatformAdmin(dbUser?.role, user.privateMetadata?.role)) {
    redirect("/");
  }

  return (
    // SidebarProvider is required so that useSidebar() works correctly
    <SidebarProvider>
      {/* Main layout wrapper: sidebar + content */}
      <div className="w-full h-full flex">
        {/* Left sidebar */}
        <Sidebar isAdmin />

        {/* Right side: header + page content */}
        <div className="flex-1 ml-[300px]">
          {/* Top header (fixed in your header component) */}
          <Header />

          {/* Page content under the header */}
          <div className="w-full mt-[75px] p-4">{children}</div>
        </div>
      </div>
    </SidebarProvider>
  );
}