import { Prisma } from "@prisma/client";
import { getAllSubCategories } from "@/src/queries/subCategory";
import { getAllStoreProducts } from "@/src/queries/product";


import { getStoreDefaultShippingDetails } from "@/src/queries/store";
import { getProducts, retrieveProductDetails, getProductPageData } from "@/src/queries/product";
import { ShippingRate } from "@prisma/client";
import countries from "@/src/data/countries.json";

import { getShippingDetails } from "@/src/queries/product";
import {
  Color,
  ProductVariantImage,
  Size,
  FreeShipping,
  FreeShippingCountry,
} from "@prisma/client";
import { getRatingStatistics } from "@/src/queries/product";
import { Review, ReviewImage, User } from "@prisma/client";

export interface DashboardSidebarMenuInterface {

label: string;
icon: string;
link: string;



}

// subcategory + parent category
export type SubCategoryWithCategoryType =Prisma.PromiseReturnType<
typeof getAllSubCategories




>[0]; 
    



//product ++ variant
export type ProductWithVariantType  =  {
    productId: string;
    variantId: string;
    name: string;
    description: string;
    variantName: string;
    variantDescription: string;
    images:{url :string}[];
    variantImage: string;
    categoryId: string;
    subCategoryId: string;
    /** Optional offer tag to attach on create / upsert */
    offerTagId?: string | null;
    isSale: boolean;
    saleEndDate?: string;
    brand: string;
    sku: string;
    weight: number;
    colors:{color:string}[];
    sizes:{size:string; quantity:number; price:number; discount:number}[];
    product_specs: { id?: string; name: string; value: string }[];
    variant_specs: { id?: string; name: string; value: string }[];
    keywords:string[];
    questions:{question:string; answer:string}[];
    createdAt: Date;
    updatedAt: Date;
    
}



export type StoreProductType = Prisma.PromiseReturnType<
  typeof getAllStoreProducts
>[0];



// Store default shipping details
export type StoreDefaultShippingType = Prisma.PromiseReturnType<
  typeof getStoreDefaultShippingDetails
>;



export type CountryWithShippingRatesType = {
  countryId: string;
  countryName: string;
  shippingRate: ShippingRate | null;
};



export interface Country{

  name: string;
  code: string;
  city: string;
  region: string;

}





export type SelectMenuOption = (typeof countries)[number];



export type ProductType = Prisma.PromiseReturnType<
  typeof getProducts
>["products"][0];


export type VariantSimplified = {
  variantId: string;
  variantSlug: string;
  variantName: string;
  images: ProductVariantImage[];
  sizes: Size[];
};



export type VariantImageType = {
  url: string;
  image: string;
};


export type ProductPageType = Prisma.PromiseReturnType<
  typeof retrieveProductDetails
>;



export type ProductPageDataType = Prisma.PromiseReturnType<
  typeof getProductPageData
>;

export type ProductShippingDetailsType = Prisma.PromiseReturnType<
  typeof getShippingDetails
>;

export type RatingStatisticsType = Prisma.PromiseReturnType<
  typeof getRatingStatistics
>;

export type StatisticsCardType = Prisma.PromiseReturnType<
  typeof getRatingStatistics
>["ratingStatistics"];

export type FreeShippingWithCountriesType = FreeShipping & {
  eligibaleCountries: FreeShippingCountry[];
};




export type CartProductType = {
  productId: string;
  variantId: string;
  productSlug: string;
  variantSlug: string;
  name: string;
  variantName: string;
  image: string;
  variantImage: string;
  sizeId: string;
  size: string;
  quantity: number;
  price: number;
  stock: number;
  weight: number;
  shippingMethod: string;
  shippingService: string;
  shippingFee: number;
  extraShippingFee: number;
  deliveryTimeMin: number;
  deliveryTimeMax: number;
  isFreeShipping: boolean;
};

/** Cart line (checkout / persisted cart). Not from Prisma when cart models are absent from schema. */
export type CartItem = {
  id: string;
  cartId: string;
  productId: string;
  variantId: string;
  sizeId: string;
  quantity: number;
  name: string;
  image: string;
  price: number;
  shippingFee: number;
  totalPrice: number;
  storeId: string;
  sku?: string;
  productSlug?: string;
  variantSlug?: string;
  size?: string;
};

export type CartWithCartItemsType = {
  id: string;
  userId?: string;
  subTotal: number;
  shippingFees: number;
  total: number;
  cartItems: CartItem[];
  coupon?: unknown;
};

/** Persisted shipping address (schema may omit model; keep in sync with DB). */
export type ShippingAddress = {
  id: string;
  userId?: string;
  default?: boolean;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state?: string | null;
  postalCode: string;
  countryId: string;
};



export type ReviewWithImageType = Review & {
  images: ReviewImage[];
  user: User;
};

//define a local sort order type
export type SortOrder = "asc" | "desc";



export type ReviewsFiltersType = {
  rating?: number;
  hasImages?: boolean;
};

export type ReviewsOrderType = {
  orderBy: "latest" | "oldest" | "highest";
};

export type ReviewDetailsType = {
  id: string;
  review: string;
  rating: number;
  images: { url: string }[];
  size: string;
  quantity: string;
  variant: string;
  color: string;
};


export type VariantInfoType = {
  variantName: string;
  variantSlug: string;
  variantImage: string;
  variantUrl: string;
  images: ProductVariantImage[];
  sizes: Size[];
  colors: Partial<Color>[];
};

/** Autocomplete row from `/api/search-products` */
export type SearchResult = {
  name: string;
  image: string;
  link: string;
};

