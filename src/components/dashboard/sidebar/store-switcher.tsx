"use client";
import { PopoverTrigger, Popover, PopoverContent, } from "@/src/components/ui/popover";

import { Check, ChevronsUpDown, Plus, PlusCircle, StoreIcon } from "lucide-react";


import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/src/components/ui/command";

import {  useRouter,useParams } from "next/navigation";

import { FC, useState } from "react";
import { Button } from "@/src/components/ui/button";

import { cn } from "@/src/lib/utils";


type PopoverTriggerProps = React.ComponentPropsWithoutRef<
typeof PopoverTrigger


>;



interface StoreSwitcherProps extends PopoverTriggerProps {
  stores: Record<string, any>[];

}





const StoreSwitcher:FC<StoreSwitcherProps> = ({ stores,className }) => {
  const params = useParams();
    const router = useRouter();

//FORMAT STORES DATA
const formattedItems = stores.map((store) => ({
    label: store.name,
    value: store.url,
}))





const [open, setOpen] = useState(false);


//get the active store 
const activeStore = formattedItems.find((store)=>store.value === params.storeUrl);






const onStoreSelect=(store: {label: string; value: string }) => {
    setOpen(false);
    router.push(`/dashboard/seller/stores/${store.value}`);
};
return <Popover open={open} onOpenChange={setOpen}>

<PopoverTrigger asChild>
    <Button variant="outline" size="sm" role="combobox" aria-expanded={open} aria-label="Select a store"
    className={cn("w-full justify-between rounded-xl border-border bg-gray-50 shadow-sm transition-all hover:scale-[1.01] hover:bg-gray-100",className)}
    >
        <StoreIcon className="mr-2 w-4 h-4" />
        {activeStore?.label}
        <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
    </Button>
</PopoverTrigger>


   <PopoverContent className="w-[260px] rounded-xl border border-border bg-white p-0 shadow-xl">
    <Command>
        <CommandList>
                     <CommandInput placeholder="Search store..." />
                     <CommandEmpty>No store found.</CommandEmpty>
                         <CommandGroup heading="Stores">
                               {

                                formattedItems.map((store) => (
                                    <CommandItem key={store.value} onSelect={()=> onStoreSelect(store)} className="text-sm cursor-pointer">
                                        <StoreIcon className="mr-2 w-4 h-4" />
                                        {store.label}
                                          <Check
                                                                    className={cn(
                                                                    "h-4 w-4 opacity-0 transition-opacity",
                                                                    activeStore?.value === store.value && "opacity-100"
                                                                    )}
                                                                />
                                    </CommandItem>
                                ))
                               }
                              
                         </CommandGroup>                  
                       
        </CommandList>    
        <CommandSeparator />
        <CommandList>
             <CommandItem className="cursor-pointer"
             onSelect={() =>
             {
                setOpen(false);
                router.push("/dashboard/seller/stores/new");
             }} 
                
                >

                <PlusCircle className="mr-2 w-4 h-4" />
                                                        Create Store </CommandItem>
    
        </CommandList>
  
    </Command>

   </PopoverContent>


</Popover>


};




export default StoreSwitcher;






