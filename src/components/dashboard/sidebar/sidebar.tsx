

//clerk
import { currentUser } from "@clerk/nextjs/server";
import { FC } from "react";
// custom ui components
import Logo from "@/src/components/shared/logo";   
import UserInfo from "./user-info";
import SidebarNavSeller from "./nav-seller";
import SidebarNavAdmin from "./nav-admin";
import { adminDashboardSidebarOptions } from "@/src/constants/data";

//menu link
import { SellerDashboardSidebarOptions } from "@/src/constants/data";
// prisma model
import { Store } from "@prisma/client";

import StoreSwitcher from "./store-switcher";

interface SidebarProps {
  isAdmin?: boolean;
  stores?: Store[];
  messageUnreadCount?: number;
}


const Sidebar: FC<SidebarProps> = async ({ isAdmin, stores, messageUnreadCount = 0 }) => {
    const user =await currentUser();
    return (
    <div className="fixed bottom-0 left-0 top-0 z-10 flex h-screen w-[300px] flex-col overflow-hidden border-r border-border bg-white p-3">
          <div className="shrink-0 px-1 py-3">
            <Logo width="100%" height="140px" />
          </div>
           <span className="mt-1 shrink-0" />
           {user && (
             <div className="shrink-0 rounded-xl border border-border bg-gray-50/80 p-2">
               <UserInfo user={user} />
             </div>
           )}
           {!isAdmin && stores && (
             <div className="mt-2 shrink-0">
               <StoreSwitcher stores={stores} />
             </div>
           )}
           <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden py-1">
            {isAdmin ? (
              <SidebarNavAdmin menuLinks={adminDashboardSidebarOptions} />
            ) : (
              <SidebarNavSeller
                menuLinks={SellerDashboardSidebarOptions}
                stores={stores ?? []}
                messageUnreadCount={messageUnreadCount}
              />
            )}
           </div>
    </div>
    
    );
};


export default Sidebar;


/*stores &&*/





