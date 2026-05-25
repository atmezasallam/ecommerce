
import ProductDetails from "@/src/components/dashboard/forms/product-details";
import { getAllCategories } from "@/src/queries/category";



export default async function SellerNewProductsPage({
    params,
}:{
    params:{storeUrl:string};
}) {

    const categories=await getAllCategories();


    return <div className="w-full"> <ProductDetails categories={categories} storeUrl={params.storeUrl}/></div>;
    
}


