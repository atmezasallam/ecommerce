"use client";

// React
import { FC, useEffect } from "react";

// Prisma model
import { Store } from "@prisma/client";

// Form handling utilities
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Schema
import { StoreFormSchema } from "@/src/lib/schema";
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
import { Checkbox } from "@/src/components/ui/checkbox";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import ImageUpload from "../shared/image-upload";
import { Textarea } from "@/src/components/ui/textarea";

// Queries
import { upsertStore } from "@/src/queries/store";

// Utils
import { v4 } from "uuid";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface StoreDetailsProps {
  data?: Store;
  
}

// 🟢 مهم: استخدم input type بدل infer/output type
type CategoryFormValues = z.input<typeof StoreFormSchema>;

const StoreDetails: FC<StoreDetailsProps> = ({ data }) => {
  const router = useRouter();

  // Form hook for managing form state and validation
  const form = useForm<CategoryFormValues>({
    mode: "onChange",
    resolver: zodResolver(StoreFormSchema),
    defaultValues: {
      name: data?.name ?? "",
      description: data?.description,
       email: data?.email,
      phone: data?.phone,
      logo: data?.logo ? [{ url: data.logo }] : [],
      cover: data?.cover ? [{ url: data?.cover }] : [],
      url: data?.url ?? "",
      // حتى لو schema مخلياه optional، هون بنعطي boolean جاهز
      featured: data?.featured ?? false,
      status: data?.status.toString(),
    },
  });


                               
const isLoading  =  form.formState.isSubmitting;
  
  // Reset form values when data changes
    useEffect(() => {
    if (data) {
      form.reset({
        name: data?.name,
        description: data?.description,
        email: data?.email,
        phone: data?.phone,
        logo: [{ url: data?.logo }],
        cover: [{ url: data?.cover }],
        url: data?.url,
        featured: data?.featured,
        status: data?.status,
        
      });
    }
  }, [data, form]);



const handleSubmit = async (values: CategoryFormValues) => {
  try {
    console.log("FORM VALUES:", JSON.stringify(values, null, 2));

    const response = await upsertStore({
      id: data?.id ? data.id : v4(),
      name: values.name,
      description: values.description,
      email: values.email,
      phone: values.phone,
      url: values.url,
      logo: values.logo[0].url,
      cover: values.cover[0].url,
      featured: values.featured,
    });

    toast.success(
      data?.id
        ? "Store has been updated."
        : `Congratulations! '${response?.name}' is now created.`
    );

    // 👇 هنا موضوع الـ redirect
    if (data?.id) {
      router.refresh(); // edit mode → بس نعمل refresh
    } else {
      router.push(`/dashboard/admin/stores/${response?.url}`); // create mode → نرجع على صفحة الكاتيجوريز
    }
  } catch (error: any) {
    console.log(error);
    toast.error("Oops!", {
      description: error.toString(),
    });
  }
};




  return (
    <AlertDialog>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Store Information</CardTitle>
          <CardDescription>
            {data?.id
              ? `Update ${data?.name} store information.`
              : " Lets create a store. You can edit store later from the store setting page."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >


                  {/* COVER IMAGE */}

               <div className="relative py-2 mb-24">



 <FormField
  control={form.control}
  name="cover"
  render={({ field }) => {
    const images = (field.value ?? []) as { url: string }[];
    return (
      <FormItem>
        <FormControl>
          <ImageUpload
            type="cover"
            cloudinary_key={CLOUDINARY_UPLOAD_PRESET}
            value={images.map((image) => image.url)}
            disabled={isLoading}
            onChange={(url: string) => field.onChange([{ url }])}
            onRemove={(url: string) =>
              field.onChange(images.filter((current) => current.url !== url))
            }
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    );
  }}
/>


    {/* LOGO */}
    <FormField
      control={form.control}
      name="logo"
      render={({ field }) => {
        const images = (field.value ?? []) as { url: string }[];

        return (
          <FormItem className="absolute -bottom-20 left-1/2 -translate-x-1/2 z-10">
            <FormControl>
              <ImageUpload
                type="profile"
                cloudinary_key={CLOUDINARY_UPLOAD_PRESET}
                value={images.map((image) => image.url)}
                disabled={isLoading}
                onChange={(url: string) => {
                  console.log("Uploaded LOGO URL:", url);
                  field.onChange([{ url }]);
                }}
                onRemove={(url: string) => {
                  field.onChange(
                    images.filter((current) => current.url !== url)
                  );
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  </div>

              
     
        {/* NAME*/}

<FormField
  control={form.control}
  name="name"
  render={({ field }) => (
    <FormItem className="flex-1">
      <FormLabel>Store name</FormLabel>
      <FormControl>
        {/* مهم جدًا: استخدمي {...field} مثل ما هو */}
        <Input placeholder="Name" {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>


{/* DESCRIPTION */}
<FormField
  control={form.control}
  name="description"
  render={({ field }) => (
    <FormItem className="flex-1">
      <FormLabel>Store description</FormLabel>
      <FormControl>
        {/* مهم جدًا: استخدمي {...field} مثل ما هو */}
        <Textarea placeholder="Description" {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>










{/* Email-phone */}

<div className="flex flex-col gap-6 md:flex-row">

<FormField
  control={form.control}
  name="email"
  render={({ field }) => (
    <FormItem className="flex-1">
      <FormLabel>Store email</FormLabel>
      <FormControl>
        {/* مهم جدًا: استخدمي {...field} مثل ما هو */}
        <Input placeholder="Email" {...field} type="email" />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

<FormField
  control={form.control}
  name="phone"
  render={({ field }) => (
    <FormItem className="flex-1">
      <FormLabel>Store phone</FormLabel>
      <FormControl>
        {/* مهم جدًا: استخدمي {...field} مثل ما هو */}
        <Input placeholder="Phone" {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

</div>









{/* URL */}

<FormField
  control={form.control}
  name="url"
  render={({ field }) => (
    <FormItem className="flex-1">
      <FormLabel>Store url</FormLabel>
      <FormControl>
        <Input placeholder="/store-url" {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>


       {/* FEATURED */}
              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value ?? false}
                        onCheckedChange={(checked) =>
                          field.onChange(checked === true)
                        }
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Featured</FormLabel>
                      <FormDescription>
                        This store will appear on the home page
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? "loading..."
                  : data?.id
                  ? "Save store information"
                  : "Create Store"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AlertDialog>
  );
};

export default StoreDetails;






