"use client";

// React
import { FC, useEffect } from "react";

// Prisma model
import { Category } from "@prisma/client";

// Form handling utilities
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Schema
import { CategoryFormSchema } from "@/src/lib/schema";
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

// Queries
import { upsertCategory } from "@/src/queries/category";

// Utils
import { v4 } from "uuid";
import { useToast } from "@/src/components/ui/use-toast";
import { useRouter } from "next/navigation";

interface CategoryDetailsProps {
  data?: Category;
  
}

// 🟢 مهم: استخدم input type بدل infer/output type
type CategoryFormValues = z.input<typeof CategoryFormSchema>;

const CategoryDetails: FC<CategoryDetailsProps> = ({ data }) => {
  const { toast } = useToast();
  const router = useRouter();

  // Form hook for managing form state and validation
  const form = useForm<CategoryFormValues>({
    mode: "onChange",
    resolver: zodResolver(CategoryFormSchema),
    defaultValues: {
      name: data?.name ?? "",
      image: data?.image ? [{ url: data.image }] : [],
      url: data?.url ?? "",
      // حتى لو schema مخلياه optional، هون بنعطي boolean جاهز
      featured: data?.featured ?? false,
    },
  });

  const isLoading = form.formState.isSubmitting;

  // Reset form values when data changes
  useEffect(() => {
    if (data) {
      form.reset({
        name: data.name ?? "",
        image: data.image ? [{ url: data.image }] : [],
        url: data.url ?? "",
        featured: data.featured ?? false,
      });
    }
  }, [data, form]);



const handleSubmit = async (values: CategoryFormValues) => {
  try {
    console.log("FORM VALUES:", JSON.stringify(values, null, 2));

    const response = await upsertCategory({
      id: data?.id ? data.id : v4(),
      name: values.name,
      url: values.url,
      image: values.image[0].url,
      featured: values.featured,
    });

    toast({
      title: data?.id
        ? "Category has been updated."
        : `Congratulations! '${response?.name}' is now created.`,
    });

    // 👇 هنا موضوع الـ redirect
    if (data?.id) {
      router.refresh(); // edit mode → بس نعمل refresh
    } else {
      router.push("/dashboard/admin/categories"); // create mode → نرجع على صفحة الكاتيجوريز
    }
  } catch (error: any) {
    console.log(error);
    toast({
      variant: "destructive",
      title: "Oops!",
      description: error.toString(),
    });
  }
};




  return (
    <AlertDialog>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Category Information</CardTitle>
          <CardDescription>
            {data?.id
              ? `Update ${data?.name} category information.`
              : " Lets create a category. You can edit category later from the categories table or the category page."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
            <FormField
  control={form.control}
  name="image"
  render={({ field }) => {
    const images = (field.value ?? []) as { url: string }[];

    return (
      <FormItem>
        <FormControl>
          <ImageUpload
            type="profile"
            // ⚠️ هنا لازم تحطي الـ key/ preset الصح تبع Cloudinary
            cloudinary_key={CLOUDINARY_UPLOAD_PRESET}
            value={images.map((image) => image.url)}
            
            disabled={isLoading}
            onChange={(url: string) => {
              console.log("Uploaded URL:", url); // بس عشان تتأكدي
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


              
            {/* NAME */}
<FormField
  control={form.control}
  name="name"
  render={({ field }) => (
    <FormItem className="flex-1">
      <FormLabel>Category name</FormLabel>
      <FormControl>
        {/* مهم جدًا: استخدمي {...field} مثل ما هو */}
        <Input placeholder="Name" {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

{/* URL */}
<FormField
  control={form.control}
  name="url"
  render={({ field }) => (
    <FormItem className="flex-1">
      <FormLabel>Category url</FormLabel>
      <FormControl>
        <Input placeholder="/category-url" {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

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
                        This Category will appear on the home page
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? "loading..."
                  : data?.id
                  ? "Save category information"
                  : "Create category"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AlertDialog>
  );
};

export default CategoryDetails;






