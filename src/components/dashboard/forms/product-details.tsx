"use client";

// React
import { FC, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

// Prisma model
import {  Category,Store, SubCategory } from "@prisma/client";

// Form handling utilities
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Schema
import { ProductFormSchema } from "@/src/lib/schema";
import { CLOUDINARY_UPLOAD_PRESET } from "@/src/lib/cloudinary-config";

// UI Components
import { AlertDialog } from "@/src/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/src/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";


import { Checkbox } from "@/src/components/ui/checkbox";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import ImageUpload from "../shared/image-upload";
import { Textarea } from "@/src/components/ui/textarea";
import { Skeleton } from "@/src/components/ui/skeleton";

// Queries
import { upsertProduct } from "@/src/queries/product";

// Utils
import { v4 } from "uuid";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Types
import { ProductWithVariantType } from "@/src/lib/types";

// Shared Components
import ImagesPreviewGrid from "../shared/images-preview-grid";
import ClickToAddInputs from "./click-to-add";


import { getAllCategoriesForCategory } from "@/src/queries/category";

//react-tag-input
import { WithContext as ReactTags, Tag } from "react-tag-input";

//react date-fns
import DateTimePicker from "react-datetime-picker";
import "react-datetime-picker/dist/DateTimePicker.css";
import "react-calendar/dist/Calendar.css";
import "react-clock/dist/Clock.css";
import { format } from "date-fns";
import { Info } from "lucide-react";

const JoditEditor = dynamic(() => import("jodit-react"), {
  ssr: false,
  loading: () => <Skeleton className="h-64 w-full" />,
});

interface ProductDetailsProps {
  data?: Partial<ProductWithVariantType>;
  categories:Category[];
  storeUrl:string;
}

// 🟢 مهم: استخدم input type بدل infer/output type
type CategoryFormValues = z.input<typeof ProductFormSchema>;

  const ProductDetails: FC<ProductDetailsProps> = ({ 
    data,
    categories,
    storeUrl,
   }) => {
  const router = useRouter();//hook for routing

  //state for subcategory
  const [subCategory,setSubCategory] = useState<SubCategory[]>([]);


//jodit editor ref
const productDecEditor = useRef(null);
const variantDecEditor= useRef(null);

 // State for product specs
 const [productSpecs, setProductSpecs] = useState<
 { name: string; value: string }[]
>(data?.product_specs || [{ name: "", value: "" }]);

  // State for product variant specs
  const [variantSpecs, setVariantSpecs] = useState<
    { name: string; value: string }[]
  >(data?.variant_specs || [{ name: "", value: "" }]);



  // State for product questions
  const [questions, setQuestions] = useState<
    { question: string; answer: string }[]
  >(data?.questions || [{ question: "", answer: "" }]);



  // Form hook for managing form state and validation
  const form = useForm<CategoryFormValues>({

    mode: "onChange",
    resolver: zodResolver(ProductFormSchema),
    defaultValues: {
      name: data?.name ?? "",
      description: data?.description ?? "",
      variantName: data?.variantName ?? "",
      variantDescription: data?.variantDescription ?? "",
      images: data?.images || [],
      variantImages: data?.variantImage ? [{url: data.variantImage}] : [],
      categoryId: data?.categoryId ?? "",
      subCategoryId: data?.subCategoryId ?? "",
      brand: data?.brand ?? "",
      sku: data?.sku ?? "",
      colors: data?.colors || [{ color: "" }],
      sizes: data?.sizes || [{ size: "", price: 0.01, discount: 0, quantity: 1 }],
      product_specs: data?.product_specs || [],
      variant_specs: data?.variant_specs || [],
      keywords: data?.keywords || [],
      isSale: data?.isSale ?? false,
      weight: data?.weight ?? 0.01,
      saleEndDate: data?.saleEndDate || format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
    },
  });

//temporary state for images
const [images,setImages] =useState<{url:string}[]>([]);

  // Watch categoryId to fetch subcategories when it changes
  const categoryId = form.watch("categoryId");




  // useEffect to get subcategories when user selects a category
  useEffect(() => {
    const getSubCategories = async () => {
      if (!categoryId) {
        setSubCategory([]);
        form.setValue("subCategoryId", "");
        return;
      }
      try {
        const subCategories = await getAllCategoriesForCategory(categoryId);
        setSubCategory(subCategories);
        // Reset subCategoryId when category changes
        form.setValue("subCategoryId", "");
      } catch (error) {
        console.error("Error fetching subcategories:", error);
        setSubCategory([]);
        form.setValue("subCategoryId", "");
      }
    };
    getSubCategories();
  }, [categoryId, form]);


// Convert keywords string[] to Tag[] format for ReactTags
const keywordsToTags = (keywords: string[]): Tag[] => {
  return keywords.map((keyword, index) => ({
    id: `${index}-${keyword}`,
    text: keyword,
  }));
};

// Convert Tag[] back to string[] for form
const tagsToKeywords = (tags: Tag[]): string[] => {
  return tags.map((tag) => tag.text);
};

  // Keywords handlers (defined after form)
  const keywords = form.watch("keywords") || [];
  const handleAddition = (tag: Tag) => {
    const currentKeywords = form.getValues("keywords") || [];
    if (currentKeywords.length < 10 && !currentKeywords.includes(tag.text)) {
      form.setValue("keywords", [...currentKeywords, tag.text], { shouldValidate: true });
    }
  };
  const handleDeleteKeyword = (index: number) => {
    const currentKeywords = form.getValues("keywords") || [];
    form.setValue("keywords", currentKeywords.filter((_, i) => i !== index), { shouldValidate: true });
  };



                               
const isLoading  =  form.formState.isSubmitting;
  
  // Reset form values when data changes
    useEffect(() => {
    if (data) {
      form.reset({
        ...data,variantImages: data.variantImage ? [{url: data.variantImage}] : [],
        // Ensure name and variantName are always strings
        name: data.name || "",
        variantName: data.variantName || "",
      });
    }
  }, [data, form]);



const handleSubmit = async (values: CategoryFormValues) => {
  try {
    // Get current form values as fallback (defensive coding)
    const currentFormValues = form.getValues();
    
    // Use submitted values or fallback to current form values
    const productName = (values.name || currentFormValues.name || "").toString().trim();
    const variantName = (values.variantName || currentFormValues.variantName || "").toString().trim();
    const brand = (values.brand || currentFormValues.brand || "").toString().trim();
    const sku = (values.sku || currentFormValues.sku || "").toString().trim();

    // Log form values for debugging
    console.log("📝 Form values being submitted:", {
      submittedName: values.name,
      submittedVariantName: values.variantName,
      submittedBrand: values.brand,
      submittedSku: values.sku,
      currentName: currentFormValues.name,
      currentVariantName: currentFormValues.variantName,
      currentBrand: currentFormValues.brand,
      currentSku: currentFormValues.sku,
      finalName: productName,
      finalVariantName: variantName,
      finalBrand: brand,
      finalSku: sku,
      allSubmittedValues: values,
      allCurrentValues: currentFormValues,
    });

    // Validate required fields before submission
    if (!productName) {
      toast.error("Validation Error", {
        description: "Product name is required and cannot be empty.",
      });
      form.setFocus("name");
      return;
    }
    if (!variantName) {
      toast.error("Validation Error", {
        description: "Variant name is required and cannot be empty.",
      });
      form.setFocus("variantName");
      return;
    }
    if (!brand) {
      toast.error("Validation Error", {
        description: "Product brand is required and cannot be empty.",
      });
      form.setFocus("brand");
      return;
    }
    if (!sku) {
      toast.error("Validation Error", {
        description: "Product SKU is required and cannot be empty.",
      });
      form.setFocus("sku");
      return;
    }

    await upsertProduct({
      productId: data?.productId ? data.productId : v4(),
      variantId: data?.variantId ? data.variantId : v4(),
      name: productName,
      description: values.description,
      variantName: variantName,
      variantDescription: values.variantDescription || "",
      images: values.images,
      variantImage: values.variantImages[0].url,
      categoryId: values.categoryId,
      subCategoryId: values.subCategoryId,
      isSale: values.isSale || false,
      saleEndDate: values.saleEndDate || "",
      brand: brand,
      sku: sku,
      weight: values.weight,
      colors: values.colors,
      sizes: (values.sizes || []).map((size) => ({
        ...size,
        discount: size.discount ?? 0,
      })),
      keywords: values.keywords || [],
      product_specs: productSpecs,
      variant_specs: variantSpecs,
      questions,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
       storeUrl

  );
    //display success message
    toast.success(
      data?.productId && data?.variantId
        ? "Product has been updated."
        : `Congratulations! '${productName}' is now created.`
    );

    router.push(`/dashboard/seller/stores/${storeUrl}/products`);
  } catch (error: any) {
    console.log(error);
    toast.error("Oops!", {
      description: error.toString(),
    });
  }
};






  // Whenever colors, sizes, keywords changes we update the form values
  const colors = form.watch("colors") || [{ color: "" }];
  const sizes = form.watch("sizes") || [{ size: "", price: 0.01, discount: 0, quantity: 1 }];
  
  useEffect(() => {
    form.setValue("product_specs", productSpecs);
    form.setValue("variant_specs", variantSpecs);
  }, [productSpecs, variantSpecs, form]);







  // Get current colors from form for debugging
 

  return (
    <AlertDialog>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
          <CardDescription>
            {data?.productId && data?.variantId
              ? `Update ${data?.name} Product information.`
              : " Lets create a Product. You can edit product later from the producy page."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(
                handleSubmit,
                (errors) => {
                  console.log("FORM VALIDATION ERRORS:", errors);
                  toast.error("Validation Error", {
                    description: "Please fill in all required fields correctly. Check the form for errors.",
                  });
                }
              )}
              className="space-y-4"
            >






              {/* PRODUCT IMAGES AND COLORS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* PRODUCT IMAGES */}
                <FormField
                  control={form.control}
                  name="images"
                  render={({ field }) => {
                    const images = (field.value ?? []) as { url: string }[];
                    const colors = form.watch("colors") as { color: string }[] || [{ color: "" }];
                    const setColors = (newColors: { color: string }[] | ((prev: { color: string }[]) => { color: string }[])) => {
                      const updatedColors = typeof newColors === "function" ? newColors(colors) : newColors;
                      form.setValue("colors", updatedColors, { shouldValidate: true });
                    };
                    return (
                      <FormItem>
                        <FormLabel>Product Images</FormLabel>
                        <FormControl>
                          <div>
                            <ImagesPreviewGrid 
                              images={images} 
                              onRemove={(url)=>
                              {
                                const updatedImages =images.filter((img)=>img.url !== url);
                                setImages(updatedImages)
                                field.onChange(updatedImages)
                              }

                              }

                              colors={colors}
                              setColors={setColors}
                              

                                />
                            <ImageUpload
                              dontShowPreview
                              type="standard"
                              cloudinary_key={CLOUDINARY_UPLOAD_PRESET}
                              value={images.map((image) => image.url)}
                              disabled={isLoading || images.length >= 6}
                              onChange={(url: string) => {
                                setImages((prevImages)=>{
                                  const updatedImages =[...prevImages,{url}];
                                  field.onChange(updatedImages)
                                  return updatedImages;
                                });
                                // Check if we already have 6 images
                                if (images.length >= 6) {
                                  toast.error("Maximum images reached", {
                                    description: "You can upload a maximum of 6 images.",
                                  });
                                  return;
                                }
                                // Check if image already exists
                                if (images.some((img) => img.url === url)) {
                                  return;
                                }
                                // Add new image to array
                                field.onChange([...images, { url }]);
                              }}
                              onRemove={(url: string) => {
                                field.onChange(images.filter((current) => current.url !== url));
                              }}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Upload at least 3 product images (max 6 images)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    ); 
                  }}
                />

                {/* COLORS */}
                <FormField
                  control={form.control}
                  name="colors"
                  render={({ field }) => {
                    const formColors = (field.value ?? [{ color: "" }]) as { color: string }[];
                    const setFormColors = (newColors: { color: string }[] | ((prev: { color: string }[]) => { color: string }[])) => {
                      if (typeof newColors === "function") {
                        // Use the current field value for function updates
                        const currentColors = (field.value ?? [{ color: "" }]) as { color: string }[];
                        const updatedColors = newColors(currentColors);
                        field.onChange(updatedColors);
                      } else {
                        field.onChange(newColors);
                      }
                    };
                    return (
                      <FormItem>
                        <FormLabel>Product Colors</FormLabel>
                        <FormControl>
                          <div className="w-full flex flex-col gap-y-3">
                            <ClickToAddInputs 
                              details={formColors}
                              setDetails={setFormColors}
                              initialDetail={{color:""}}
                              colorPicker={true}
                            />

                            
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>

              
     
              {/*         NAME & VARIANT NAME              */}

               <div className="flex flex-col lg:flex-row gap-4 ">

<FormField
  disabled={isLoading}
  control={form.control}
  name="name"
  render={({ field }) => (
    <FormItem className="flex-1">
      <FormLabel>Product name</FormLabel>
      <FormControl>
        {/* مهم جدًا: استخدمي {...field} مثل ما هو */}
        <Input placeholder="Name" {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
{/* VARIANT NAME */}

<FormField
 disabled={isLoading}
  control={form.control}
  name="variantName"
  render={({ field }) => (
    <FormItem className="flex-1">
      <FormLabel> Variant name</FormLabel>
      <FormControl>
        {/* مهم جدًا: استخدمي {...field} مثل ما هو */}
        <Input placeholder="Name" {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

               </div>

              {/*       DESCRIPTION & VARIANT DESCRIPTION  (taps)*/}
              <Tabs defaultValue="product" className="w-full">
                  <TabsList className="w-full grid grid-cols-2 gap-x-4">
                    <TabsTrigger value="product">product description</TabsTrigger>
                    <TabsTrigger value="variant">variant description</TabsTrigger>
                  </TabsList>
                  <TabsContent value="product"><FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                          <FormItem className="flex-1">
                                          
                                            <FormControl>
                                             <JoditEditor
                                             ref={productDecEditor}
                                             value={form.getValues("description")}
                                             onChange={(content) => {
                                              form.setValue("description", content, { shouldValidate: true });
                                             }}
                                             />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                                />  
                                                  </TabsContent>





                                                  <TabsContent value="variant">
                                                    <FormField
                                                  control={form.control}
                                                  name="variantDescription"
                                                  render={({ field }) => (
                                                    <FormItem className="flex-1">
                                      
                                                      <FormControl>
                                                      <JoditEditor
                                             ref={productDecEditor}
                                             value={form.getValues("variantDescription") || ""}
                                             onChange={(content) => {
                                              form.setValue("variantDescription", content);
                                             }}
                                             />
                                                      </FormControl>
                                                      <FormMessage />
                                                    </FormItem>
                                                  )}
                                                />
                                                </TabsContent>
             
             
                                               </Tabs>









              {/*        category & subcategory             */}

     
               <div className="flex gap-4">

               <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Product Category</FormLabel>

                    <Select
                      disabled={isLoading || categories.length == 0}
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            defaultValue={field.value}
                            placeholder="Select a category"
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />

               {

                form.watch("categoryId") &&  <FormField
                control={form.control}
                name="subCategoryId"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Product SubCategory</FormLabel>

                    <Select
                      disabled={isLoading || subCategory.length === 0}
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            defaultValue={field.value}
                            placeholder="Select a subcategory"
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {subCategory.map((subCat) => (
                          <SelectItem key={subCat.id} value={subCat.id}>
                            {subCat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />
               }
              
               </div>

               {/*             BRAND & SKU & WEIGHT                    */}
                
                <div className="flex flex-col lg:flex-row gap-4 ">

                  
                    <FormField
                      disabled={isLoading}
                      control={form.control}
                      name="brand"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Product brand</FormLabel>
                          <FormControl>
                            {/* مهم جدًا: استخدمي {...field} مثل ما هو */}
                            <Input placeholder="Brand" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />



                     <FormField
                      disabled={isLoading}
                      control={form.control}
                      name="sku"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Product sku</FormLabel>
                          <FormControl>
                            {/* مهم جدًا: استخدمي {...field} مثل ما هو */}
                            <Input placeholder="Sku" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    

<FormField
                      disabled={isLoading}
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem className="flex-1 min-w-[200px]">
                          <div className="flex flex-wrap items-center gap-2">
                            <FormLabel className="text-base font-semibold">
                              Product weight
                            </FormLabel>
                            <span className="rounded-md border border-border bg-muted/60 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                              Optional
                            </span>
                          </div>
                          <FormControl>
                            <div className="relative w-full max-w-[240px]">
                              <Input
                                type="number"
                                inputMode="decimal"
                                min={0}
                                max={1000}
                                step={0.01}
                                placeholder="e.g. 0.5"
                                disabled={isLoading}
                                className="h-10 pr-11 tabular-nums"
                                name={field.name}
                                ref={field.ref}
                                onBlur={field.onBlur}
                                value={field.value === 0 ? "" : field.value}
                                onChange={(e) => {
                                  const raw = e.target.value;
                                  field.onChange(
                                    raw === "" ? 0 : Number.parseFloat(raw) || 0
                                  );
                                }}
                              />
                              <span
                                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium tabular-nums text-muted-foreground"
                                aria-hidden
                              >
                                kg
                              </span>
                            </div>
                          </FormControl>
                          <div className="mt-2 flex gap-2.5 rounded-lg border border-dashed border-border/80 bg-muted/25 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
                            <Info
                              className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                              aria-hidden
                            />
                            <p>
                              Used for weight-based shipping rates. Leave empty or enter{" "}
                              <span className="font-medium text-foreground">0</span> to use the
                              default{" "}
                              <span className="font-medium text-foreground">0.01 kg</span>.
                            </p>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                </div>

                  {/* Variant image - Keywords*/}
              <div className="flex items-center gap-10 py-14">
                {/* Variant image */}
                <div className="border-r pr-10">
                  <FormField
                    control={form.control}
                    name="variantImages"
                    render={({ field }) => {
                      const variantImages = (field.value ?? []) as { url: string }[];
                      return (
                        <FormItem>
                          <FormLabel>Variant Image</FormLabel>
                          <FormControl>
                            <ImageUpload
                              dontShowPreview
                              type="profile"
                              cloudinary_key={CLOUDINARY_UPLOAD_PRESET}
                              value={variantImages.map((image) => image.url)}
                              disabled={isLoading}
                              onChange={(url) => field.onChange([{ url }])}
                              onRemove={(url) =>
                                field.onChange(
                                  variantImages.filter(
                                    (current) => current.url !== url
                                  )
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage className="!mt-4" />
                        </FormItem>
                      );
                    }}
                  />
                </div>
                {/* Keywords */}
                <div className="w-full flex-1 space-y-3">
                  <FormField
                    control={form.control}
                    name="keywords"
                    render={({ field }) => {
                      const currentKeywords = field.value || [];
                      const tags = keywordsToTags(currentKeywords);
                      return (
                        <FormItem className="relative flex-1">
                          <FormLabel>Product Keywords</FormLabel>
                          <FormControl>
                            <ReactTags
                              tags={tags}
                              handleAddition={handleAddition}
                              handleDelete={(index) => {
                                handleDeleteKeyword(index);
                              }}
                              placeholder="Keywords (e.g., winter jacket, warm, stylish)"
                              classNames={{
                                tagInputField:
                                  "bg-background border rounded-md p-2 w-full focus:outline-none",
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            Add up to 10 keywords. Press Enter to add a keyword.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </div>
              </div>

              {/*       SIZES, PRICE, DISCOUNT, QUANTITY       */}
                <FormField
                 control={form.control}
            name="sizes"
            render={({ field }) => {
              const formSizes = (field.value ?? [{ size: "", price: 0.01, discount: 0, quantity: 1 }]) as { size: string; price: number; discount: number; quantity: number }[];
              const setFormSizes = (newSizes: { size: string; price: number; discount: number; quantity: number }[] | ((prev: { size: string; price: number; discount: number; quantity: number }[]) => { size: string; price: number; discount: number; quantity: number }[])) => {
                if (typeof newSizes === "function") {
                  // Use the current field value for function updates
                  const currentSizes = (field.value ?? [{ size: "", price: 0.01, discount: 0, quantity: 1 }]) as { size: string; price: number; discount: number; quantity: number }[];
                  const updatedSizes = newSizes(currentSizes);
                  form.setValue("sizes", updatedSizes, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                } else {
                  form.setValue("sizes", newSizes, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                }
              };
              return (
                <FormItem>
                  <FormLabel>Sizes, Price, Discount, Quantity</FormLabel>
                  <FormControl>
                    <div className="w-full flex flex-col gap-y-3 ">
                      <ClickToAddInputs 
                        details={formSizes}
                        setDetails={setFormSizes}
                        initialDetail={{ size: "", price: 0.01, discount: 0, quantity: 1 }}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Add at least one size option with price, discount, and quantity.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              );
                   }}
                  />

               {/*     product and variant   specs               */}
          
               <Tabs defaultValue="productSpecs" className="w-full">
                  <TabsList className="w-full grid grid-cols-2 gap-x-4">
                    <TabsTrigger value="productSpecs">product specifications</TabsTrigger>
                    <TabsTrigger value="variantSpecs">variant specifications</TabsTrigger>
                  </TabsList>
                      <TabsContent value="productSpecs">


                      <div className="w-full flex flex-col gap-y-3">
                  <ClickToAddInputs
                    details={productSpecs}
                    setDetails={setProductSpecs}
                    initialDetail={{
                    name: "",
                    value: "",
                    }}
                    
                  />
                  {form.formState.errors.product_specs && (
                    <span className="text-sm font-medium text-destructive">
                      {form.formState.errors.product_specs.message}
                    </span>
                  )}
                </div>




















                      </TabsContent>
                      <TabsContent value="variantSpecs">

                      <div className="w-full flex flex-col gap-y-3">
                  <ClickToAddInputs
                    details={variantSpecs}
                    setDetails={setVariantSpecs}
                    initialDetail={{
                     name: "",
                     value: "",
                    }}
                   
                  />
                  {form.formState.errors.variant_specs && (
                    <span className="text-sm font-medium text-destructive">
                      {form.formState.errors.variant_specs.message}
                    </span>
                  )}
                </div> 
                      </TabsContent>
                    </Tabs>

                 
                  <div className="w-full flex flex-col gap-y-3">
                    <ClickToAddInputs
                      details={questions}
                      setDetails={setQuestions}
                      initialDetail={{
                        question: "",
                        answer: "",
                      }}
                      containerClassName="flex-1"
                      inputClassName="w-full"
                    />
                  </div>
            
            

              {/*            is on sale                         */}
               <div className="flex boareder rounded-md ">
              <FormField
                control={form.control}
                name="isSale"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value ?? false}
                        onCheckedChange={(checked) =>
                          field.onChange(checked === true)
                        }
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>On Sale</FormLabel>
                      <FormDescription>
                        is this product on sale?
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />



           {
              form.getValues().isSale && (
                <FormField
                control={form.control}
                name="saleEndDate"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 p-4">
                    <FormControl>
                      <DateTimePicker
                        onChange={(date) => {
                          field.onChange(date ? format(date, "yyyy-MM-dd'T'HH:mm:ss") : "")
                        }}
                        value={field.value ? new Date(field.value) : null}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )
           }

                </div>



              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? "loading..."
                  : data?.productId && data.variantId
                  ? "Save product information"
                  : "Create product"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AlertDialog>
  );
};

export default ProductDetails;