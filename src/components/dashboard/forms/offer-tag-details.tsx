"use client";

// React
import { FC, useEffect } from "react";

// Prisma model
import { OfferTag } from "@prisma/client";

// Form handling utilities
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Schema
import { OfferTagFormSchema } from "@/src/lib/schema";

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
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";

// Queries
import { upsertOfferTag } from "@/src/queries/offerTag";

// Utils
import { v4 } from "uuid";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface OfferTagDetailsProps {
  data?: OfferTag;
}

// Use input type for form values
type OfferTagFormValues = z.input<typeof OfferTagFormSchema>;

const OfferTagDetails: FC<OfferTagDetailsProps> = ({ data }) => {
  const router = useRouter();

  // Form hook for managing form state and validation
  const form = useForm<OfferTagFormValues>({
    mode: "onChange",
    resolver: zodResolver(OfferTagFormSchema),
    defaultValues: {
      name: data?.name ?? "",
      url: data?.url ?? "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  // Reset form values when data changes
  useEffect(() => {
    if (data) {
      form.reset({
        name: data.name ?? "",
        url: data.url ?? "",
      });
    }
  }, [data, form]);

  const handleSubmit = async (values: OfferTagFormValues) => {
    try {
      const response = await upsertOfferTag({
        id: data?.id ? data.id : v4(),
        name: values.name,
        url: values.url,
      });

      toast.success(
        data?.id
          ? "Offer tag has been updated."
          : `Congratulations! '${response?.name}' is now created.`
      );

      // Navigate based on context
      if (data?.id) {
        router.refresh(); // Edit mode - refresh current page
      } else {
        router.push("/dashboard/admin/offer-tags"); // Create mode - go to list page
      }
    } catch (error: any) {
      console.log(error);
      toast.error("Oops!", {
        description: error?.message || error.toString(),
      });
    }
  };

  return (
    <AlertDialog>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Offer Tag Information</CardTitle>
          <CardDescription>
            {data?.id
              ? `Update ${data?.name} offer tag information.`
              : "Let's create an offer tag. You can edit it later from the offer tags table."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              {/* NAME */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Offer Tag Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Summer Sale" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter a unique name for the offer tag.
                    </FormDescription>
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
                    <FormLabel>Offer Tag URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/offer"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter a valid URL for the offer tag (e.g.,
                      https://example.com).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? "Loading..."
                  : data?.id
                  ? "Save Offer Tag"
                  : "Create Offer Tag"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AlertDialog>
  );
};

export default OfferTagDetails;

