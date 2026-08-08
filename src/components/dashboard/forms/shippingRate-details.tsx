"use client";

// React
import { FC, useEffect } from "react";

// Form handling utilities
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Schema
import { ShippingRateFormSchema } from "@/src/lib/schema";

// UI Components
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
} from "@/src/components/ui/form";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";

// Queries
// TODO: Import upsertShippingRate when it's created
import { upsertShippingRate } from "@/src/queries/store";

// Utils
import { v4 } from "uuid";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CountryWithShippingRatesType } from "@/src/lib/types";
import { Textarea } from "@/src/components/ui/textarea";
import { useModal } from "@/src/providers/modal.provider";

interface ShippingRateDetailsProps {
  data?: CountryWithShippingRatesType;
  storeUrl: string;
}

const ShippingRateDetails: FC<ShippingRateDetailsProps> = ({
  data,
  storeUrl,
}) => {
  // Initializing necessary hooks
  const router = useRouter(); // Hook for routing
  const { setClose } = useModal(); // Hook for closing modal

  // Form hook for managing form state and validation
  const form = useForm<z.infer<typeof ShippingRateFormSchema>>({
    mode: "onChange", // Form validation mode
    resolver: zodResolver(ShippingRateFormSchema), // Resolver for form validation
    defaultValues: {
      // Setting default form values from data (if available)
      countryId: data?.countryId,
      countryName: data?.countryName,
      shippingService: data?.shippingRate
        ? data?.shippingRate.shippingService
        : "",
      shippingFeePerItem: data?.shippingRate
        ? data?.shippingRate.shippingFeePerItem
        : 0,
      shippingFeeForAdditionalItem: data?.shippingRate
        ? data?.shippingRate.shippingFeeForAdditionalItem
        : 0,
      shippingFeePerKg: data?.shippingRate
        ? data?.shippingRate.shippingFeePerKg
        : 0,
      shippingFeeFixed: data?.shippingRate
        ? data?.shippingRate.shippingFeeFixed
        : 0,
      deliveryTimeMin: data?.shippingRate
        ? data?.shippingRate.deliveryTimeMin
        : 1,
      deliveryTimeMax: data?.shippingRate
        ? data?.shippingRate.deliveryTimeMax
        : 1,
      returnPolicy: data?.shippingRate ? data.shippingRate.returnPolicy : "",
    },
  });

  // Loading status based on form submission
  const isLoading = form.formState.isSubmitting;

  // Reset form values when data changes
  useEffect(() => {
    if (data) {
      form.reset({
        countryId: data.countryId,
        countryName: data.countryName,
        shippingService: data.shippingRate?.shippingService || "",
        shippingFeePerItem: data.shippingRate?.shippingFeePerItem ?? 0,
        shippingFeeForAdditionalItem: data.shippingRate?.shippingFeeForAdditionalItem ?? 0,
        shippingFeePerKg: data.shippingRate?.shippingFeePerKg ?? 0,
        shippingFeeFixed: data.shippingRate?.shippingFeeFixed ?? 0,
        deliveryTimeMin: data.shippingRate?.deliveryTimeMin ?? 7,
        deliveryTimeMax: data.shippingRate?.deliveryTimeMax ?? 31,
        returnPolicy: data.shippingRate?.returnPolicy || "",
      });
    }
  }, [data, form]);


  
 // Submit handler for form submission
 const handleSubmit = async (
    values: z.infer<typeof ShippingRateFormSchema>
  ) => {
    try {
      // Ensure countryId is provided
      if (!data?.countryId) {
        throw new Error("Country ID is required");
      }

      // Get all current form values to ensure we have everything
      const allValues = form.getValues();
      console.log("FORM VALUES (from handleSubmit):", values);
      console.log("ALL FORM VALUES (from getValues):", allValues);

      // Prepare shipping rate data with proper defaults - ensure all are numbers
      // Use allValues as fallback to get any values that might not be in the submitted values
      const formData = { ...allValues, ...values };
      
      const shippingRateData = {
        id: data?.shippingRate?.id || v4(),
        countryId: data.countryId,
        shippingService: formData.shippingService || "",
        shippingFeePerItem: formData.shippingFeePerItem != null ? Number(formData.shippingFeePerItem) : 0,
        shippingFeeForAdditionalItem: formData.shippingFeeForAdditionalItem != null ? Number(formData.shippingFeeForAdditionalItem) : 0,
        shippingFeePerKg: formData.shippingFeePerKg != null ? Number(formData.shippingFeePerKg) : 0,
        shippingFeeFixed: formData.shippingFeeFixed != null ? Number(formData.shippingFeeFixed) : 0,
        deliveryTimeMin: formData.deliveryTimeMin != null ? Number(formData.deliveryTimeMin) : 7,
        deliveryTimeMax: formData.deliveryTimeMax != null ? Number(formData.deliveryTimeMax) : 31,
        returnPolicy: formData.returnPolicy || "",
        storeId: "", // Will be set in the function
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      console.log("SHIPPING RATE DATA:", shippingRateData);

      // Upserting shipping rate data
      const response = await upsertShippingRate(storeUrl, shippingRateData);

      if (response.id) {
        // Displaying success message
        toast.success("Shipping rates updated successfully!");

        // Close the modal
        setClose();

        // Refresh data
        router.refresh();
      }
    } catch (error: any) {
      // Handling form submission errors
      console.log(error);
      toast.error("Oops!", {
        description: error.toString(),
      });
    }
  };




  return (
    <Card className="w-full border-0 shadow-none">
      <CardHeader className="px-0">
        <CardTitle>Shipping Rate</CardTitle>
        <CardDescription>
          Update Shipping rate information for {data?.countryName}.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              <div className="hidden">
                <FormField
                  disabled
                  control={form.control}
                  name="countryId"
                  render={({ field }) => (
                    <FormItem className="flex-1 ">
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="space-y-4">
                <FormField
                  disabled
                  control={form.control}
                  name="countryName"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name="shippingService"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input {...field} placeholder="Shipping service" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name="shippingFeePerItem"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Shipping fee per item</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          value={field.value ?? 0}
                          onChange={(e) => {
                            const val = e.target.value === '' ? 0 : (isNaN(parseFloat(e.target.value)) ? 0 : parseFloat(e.target.value));
                            field.onChange(val);
                          }}
                          onBlur={field.onBlur}
                          name={field.name}
                          placeholder="Shipping fee per item"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name="shippingFeeForAdditionalItem"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Shipping fee for additional item</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          value={field.value ?? 0}
                          onChange={(e) => {
                            const val = e.target.value === '' ? 0 : (isNaN(parseFloat(e.target.value)) ? 0 : parseFloat(e.target.value));
                            field.onChange(val);
                          }}
                          onBlur={field.onBlur}
                          name={field.name}
                          placeholder="Shipping fee for additional item"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name="shippingFeePerKg"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Shipping fee per kg</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          value={field.value ?? 0}
                          onChange={(e) => {
                            const val = e.target.value === '' ? 0 : (isNaN(parseFloat(e.target.value)) ? 0 : parseFloat(e.target.value));
                            field.onChange(val);
                          }}
                          onBlur={field.onBlur}
                          name={field.name}
                          placeholder="Shipping fee per kg"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name="shippingFeeFixed"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Fixed Shipping fee</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          value={field.value ?? 0}
                          onChange={(e) => {
                            const val = e.target.value === '' ? 0 : (isNaN(parseFloat(e.target.value)) ? 0 : parseFloat(e.target.value));
                            field.onChange(val);
                          }}
                          onBlur={field.onBlur}
                          name={field.name}
                          placeholder="Fixed shipping fee"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name="deliveryTimeMin"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Delivery time min </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          value={field.value ?? 7}
                          onChange={(e) => {
                            const val = e.target.value === '' ? 7 : (isNaN(parseInt(e.target.value)) ? 7 : parseInt(e.target.value));
                            field.onChange(val);
                          }}
                          onBlur={field.onBlur}
                          name={field.name}
                          placeholder="Minimum Delivery time (days)"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name="deliveryTimeMax"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Delivery time max </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          value={field.value ?? 31}
                          onChange={(e) => {
                            const val = e.target.value === '' ? 31 : (isNaN(parseInt(e.target.value)) ? 31 : parseInt(e.target.value));
                            field.onChange(val);
                          }}
                          onBlur={field.onBlur}
                          name={field.name}
                          placeholder="Maximum Delivery time (days)"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name="returnPolicy"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Return policy</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="What's the return policy for your store ?"
                          className="p-4"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="mt-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "loading..." : "Save changes"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
  );
};

export default ShippingRateDetails;