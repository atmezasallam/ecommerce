"use client";
import { DashboardSidebarMenuInterface } from "@/src/lib/types";
import { Command, CommandItem } from "@/src/components/ui/command";
import { CommandEmpty, CommandGroup, CommandInput, CommandList } from "@/src/components/ui/command";
import { icons } from "@/src/constants/icons";
import { cn } from "@/src/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SidebarNavAdmin({
    menuLinks,

    }:{
    
    menuLinks:DashboardSidebarMenuInterface[];

    }) {
      const pathname=usePathname();

                return (
  <nav className="relative flex min-h-0 flex-1 flex-col">
    <Command className="flex h-full min-h-0 flex-1 flex-col rounded-lg bg-transparent">
      <CommandInput placeholder="Search..." className="mb-1 rounded-xl border-border bg-gray-50" />
      <CommandList className="max-h-none min-h-0 flex-1 overflow-y-auto overflow-x-hidden py-2">
        <CommandEmpty>No Links Found.</CommandEmpty>
        <CommandGroup className="relative overflow-x-hidden pt-0">
          {menuLinks.map((menuLink, index) => {
            let icon;
            const iconSearch = icons.find(
              (icon) => icon.value === menuLink.icon
            );

            if (iconSearch) {
              const Icon = iconSearch.path;
              icon = <Icon />;
            }

            return (
              <CommandItem
                key={index}
                className={cn(
                  "group relative mx-2 mt-1 h-12 w-full cursor-pointer rounded-xl px-0 py-0 transition-all duration-300 hover:translate-x-1 hover:scale-[1.02] hover:bg-black/10 hover:shadow-md",
                  {
                    "bg-[#95CFB2]/20 border-l-4 border-[#95CFB2] text-[#2d6b54] shadow-lg shadow-[#95CFB2]/30":
                      pathname==menuLink.link,
                  }
                )}
              >
                <Link
                  href={menuLink.link}
                  className={cn(
                    "flex h-12 w-full items-center gap-2 rounded-xl px-4 transition-all hover:bg-transparent",
                    pathname==menuLink.link ? "text-[#2d6b54]" : "text-subtle dark:text-subtle"
                  )}
                >
                  <span className="transition-transform duration-300 group-hover:scale-110">{icon}</span>
                  <span className="font-medium">{menuLink.label}</span>
                </Link>
                {pathname!==menuLink.link && (
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
























/*
    return ( 
         <nav className="relative grow">
        <Command className="rounded-lg overflow-visible bg-transparent">
            <CommandInput placeholder="Search..."/>
            <CommandList className="py-2 overflow-visible">
                <CommandEmpty>No Links Found.</CommandEmpty>
                <CommandGroup className="overflow-visible pt-0 relative">

                    {

                        menuLinks.map((Link,index) => {
                            let icon;
                            const iconSearch=icons.find((icon)=>icon.value==Link.icon);
                            if(iconSearch) icon=<iconSearch.path/>;
                                
                            
                         return (
                           <CommandItem 
                           key={index}
                            className={cn ("w-full h-12 cursor-pointer")}

                         >
                            <Link href={link.link}
                             className="flex items-center gap-2 hover:bg-transparent rounded-md transition-all w-full"/>

                               {icon}
                                 
                         </CommandItem>

                         );
                         

                    })}

                      
                     
                        
                </CommandGroup>
            </CommandList>
        </Command>
    </nav>
     
   
                );       
    
} */
