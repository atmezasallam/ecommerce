"use client";
import type { Store } from "@prisma/client";
import { DashboardSidebarMenuInterface } from "@/src/lib/types";
import { Command, CommandItem } from "@/src/components/ui/command";
import { CommandEmpty, CommandGroup, CommandInput, CommandList } from "@/src/components/ui/command";
import { icons } from "@/src/constants/icons";
import { cn } from "@/src/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

import MessageBadge from "@/src/components/messages/MessageBadge";

export default function SidebarNavSeller({
  menuLinks,
  stores = [],
  messageUnreadCount = 0,
}: {
  menuLinks: DashboardSidebarMenuInterface[];
  stores?: Pick<Store, "url">[];
  messageUnreadCount?: number;
}) {
  const pathname = usePathname();

  const storeUrlStart = pathname.split("/stores/")[1];
  const pathStore = storeUrlStart ? storeUrlStart.split("/")[0] : "";
  const activeStore = pathStore || stores[0]?.url || "";

     const resolveHref = (menuLink: { link: string }) => {
       if (menuLink.link.startsWith("/")) {
         return menuLink.link;
       }
       if (menuLink.link === "") {
         return `/dashboard/seller/stores/${activeStore}`;
       }
       return `/dashboard/seller/stores/${activeStore}/${menuLink.link}`;
     };

     const isActiveLink = (menuLink: { link: string }) => {
       const href = resolveHref(menuLink);
       if (menuLink.link.startsWith("/")) {
         return pathname === href || pathname.startsWith(`${href}/`);
       }
       if (menuLink.link === "") {
         return pathname === `/dashboard/seller/stores/${activeStore}`;
       }
       return pathname === `/dashboard/seller/stores/${activeStore}/${menuLink.link}`;
     };

                return (
  <nav className="relative flex min-h-0 flex-1 flex-col">
    <Command className="flex h-full min-h-0 flex-1 flex-col rounded-lg bg-transparent">
      <CommandInput placeholder="Search..." className="mb-1 rounded-xl border-border bg-gray-50" />
      <CommandList className="max-h-none min-h-0 flex-1 overflow-y-auto overflow-x-hidden py-2">
        <CommandEmpty>No Links Found.</CommandEmpty>
        <CommandGroup className="relative overflow-x-hidden pt-0">
          {menuLinks.map((menuLink, index) => {
            let icon = null;
            const iconSearch = icons.find(
              (icon) => icon.value === menuLink.icon
            );

            if (iconSearch?.path) {
              const Icon = iconSearch.path;
              icon = <Icon />;
            }

            return (
              <CommandItem
                key={index}
                className={cn(
                  "group relative mx-2 mt-1 h-12 w-full cursor-pointer rounded-xl px-0 py-0 transition-all duration-300 hover:translate-x-1 hover:scale-[1.02] hover:bg-black/10 hover:shadow-md",
                  {
                    "bg-[#95CFB2]/20 border-l-4 border-[#95CFB2] text-[#2d6b54] shadow-lg shadow-[#95CFB2]/30": isActiveLink(
                      menuLink
                    ),
                  }
                )}
              >
                <Link
                  href={resolveHref(menuLink)}
                  className={cn(
                    "flex h-12 w-full items-center gap-2 rounded-xl px-4 transition-all hover:bg-transparent",
                    isActiveLink(menuLink) ? "text-[#2d6b54]" : "text-subtle dark:text-subtle"
                  )}
                >
                  <span className={cn("transition-transform duration-300 group-hover:scale-110", isActiveLink(menuLink) && "text-[#2d6b54]")}>
                    {icon}
                  </span>
                  <span className="flex flex-1 items-center justify-between gap-2 font-medium">
                    <span>{menuLink.label}</span>
                    {menuLink.link === "/dashboard/seller/messages" && (
                      <MessageBadge count={messageUnreadCount} />
                    )}
                  </span>
                </Link>
                {!isActiveLink(menuLink) && (
                  <span className="pointer-events-none absolute inset-y-2 left-0 w-1 rounded-r-full bg-transparent transition-colors group-hover:bg-[#95CFB2]/50" />
                )}
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </Command>
  </nav>
);


}
