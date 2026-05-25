"use client";

// React
import { FC, useEffect } from "react";

// Prisma model
import { Category, SubCategory } from "@prisma/client";

// ui components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

// Form handling utilities
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Schema
import { SubCategoryFormSchema } from "@/src/lib/schema";

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
import { upsertSubCategory } from "@/src/queries/subCategory";

// Utils
import { v4 } from "uuid";
import { useToast } from "@/src/components/ui/use-toast";
import { useRouter } from "next/navigation";

interface SubCategoryDetailsProps {
  data?: SubCategory;
  categories: Category[];
}

// 🟢 استخدم input type
type SubCategoryFormValues = z.input<typeof SubCategoryFormSchema>;

const SubCategoryDetails: FC<SubCategoryDetailsProps> = ({
  data,
  categories,
}) => {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<SubCategoryFormValues>({
    mode: "onChange",
    resolver: zodResolver(SubCategoryFormSchema),
    defaultValues: {
      name: data?.name ?? "",
      image: data?.image ? [{ url: data.image }] : [],
      url: data?.url ?? "",
      featured: data?.featured ?? false,
      categoryId: data?.categoryId,
    },
  });

  const isLoading = form.formState.isSubmitting;

  useEffect(() => {
    if (data) {
      form.reset({
        name: data.name ?? "",
        image: data.image ? [{ url: data.image }] : [],
        url: data.url ?? "",
        featured: data.featured ?? false,
        categoryId: data.categoryId,
      });
    }
  }, [data, form]);

  const handleSubmit = async (values: SubCategoryFormValues) => {
    try {
      console.log("FORM VALUES:", JSON.stringify(values, null, 2));

      const response = await upsertSubCategory({
        id: data?.id ? data.id : v4(),
        name: values.name,
        url: values.url,
        image: values.image[0].url,
        featured: values.featured,
        categoryId: values.categoryId,
      });

      toast({
        title: data?.id
          ? "Sub-category has been updated."
          : `Congratulations! '${response?.name}' is now created.`,
      });

      if (data?.id) {
        router.refresh();
      } else {
        router.push("/dashboard/admin/subCategories");
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
          <CardTitle>SubCategory Information</CardTitle>
          <CardDescription>
            {data?.id
              ? `Update ${data?.name} subCategory information.`
              : "Lets create a SubCategory. You can edit the SubCategory later from the SubCategories table or the SubCategory page."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              {/* IMAGE */}
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
                          cloudinary_key="salam7778"
                          value={images.map((image) => image.url)}
                          disabled={isLoading}
                          onChange={(url: string) => {
                            field.onChange([{ url }]);
                          }}
                          onRemove={(url: string) => {
                            field.onChange(
                              images.filter(
                                (current) => current.url !== url
                              )
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
                    <FormLabel>SubCategory name</FormLabel>
                    <FormControl>
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
                    <FormLabel>SubCategory url</FormLabel>
                    <FormControl>
                      <Input placeholder="/SubCategory-url" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* CATEGORY */}
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Category</FormLabel>

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
                        This SubCategory will appear on the home page
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? "loading..."
                  : data?.id
                  ? "Save SubCategory information"
                  : "Create SubCategory"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AlertDialog>
  );
};

export default SubCategoryDetails;
