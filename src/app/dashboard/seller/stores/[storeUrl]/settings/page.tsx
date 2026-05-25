//db
import { db } from "@/src/lib/db";


import StoreDetails from "@/src/components/dashboard/forms/store-details";
import { redirect } from "next/navigation";



export default async function SellerStoreSettingsPage({
    params,
}:{
    params:{storeUrl:string};


}) {
    const storeDetails=await db.store.findUnique({
        
        where:{
          url: params.storeUrl, //url must be unique  

        },
    });

    if(!storeDetails) redirect("/dashboard/seller/stores");
        
    
    return(
       <div>

        <StoreDetails data={storeDetails}/>
        
        
        </div>
    );
}