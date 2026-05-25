"use client";
import { Form, FormControl, FormField, FormItem } from "@/src/components/ui/form";
import { AddReviewSchema } from "@/src/lib/schema";
import {
  ReviewDetailsType,
  ReviewWithImageType,
  VariantInfoType,
} from "@/src/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import StarRating from "@/src/components/store/shared/star-rating";
import { z } from "zod";
import Select from "@/src/components/store/ui/select";
import Input from "../ui/input";
import { Button } from "../ui/button";
import { PulseLoader } from "react-spinners";
import ImageUploadStore from "@/src/components/store/shared/upload-images";
import { upsertReview } from "@/src/queries/review";
import { v4 } from "uuid";

export default function ReviewDetails({
  productId,
  data,
  variantsInfo,
  setReviews,
  reviews,
}: {
  productId: string;
  data?: ReviewDetailsType;
  variantsInfo: VariantInfoType[];
  reviews: ReviewWithImageType[];
  setReviews: Dispatch<SetStateAction<ReviewWithImageType[]>>;
}) {
  // State for selected Variant
  const [activeVariant, setActiveVariant] = useState<VariantInfoType>(
    variantsInfo[0]
  );

  // Temporary state for images
  const [images, setImages] = useState<{ url: string }[]>([]);

  // State for sizes
  const [sizes, setSizes] = useState<{ name: string; value: string }[]>([]);

  // Form hook for managing form state and validation
  const form = useForm<z.infer<typeof AddReviewSchema>>({
    mode: "onChange",
    resolver: zodResolver(AddReviewSchema),
    defaultValues: {
      variantName: data?.variant || activeVariant.variantName,
      rating: data?.rating ?? 0,
      size: data?.size ?? "",
      review: data?.review ?? "",
      quantity: data?.quantity ?? "1",
      images: data?.images ?? [],
      color: data?.color ?? "",
    },
  });

  // Loading status based on form submission
  const isLoading = form.formState.isSubmitting;

  // Errors
  const errors = form.formState.errors;

  // Submit handler for form submission
  const handleSubmit = async (values: z.infer<typeof AddReviewSchema>) => {
    try {
      const response = await upsertReview(productId, {
        id: data?.id || v4(),
        variant: values.variantName,
        images: values.images,
        quantity: values.quantity,
        rating: values.rating,
        review: values.review,
        size: values.size,
        color: values.color,
      });
      if (response.id) {
        const rev = reviews.filter((rev) => rev.id !== response.id);
        setReviews([...rev, response]);
      }
      toast.success("Review Added Successfully");
    } catch (error: any) {
      // Handling form submission errors
      console.log(error);
      toast.error(error.toString());
    }
  };

  const variants = variantsInfo.map((v) => ({
    name: v.variantName,
    value: v.variantName,
    image: v.variantImage,
    colors: v.colors
      .map((c) => c.name)
      .filter((name) => !!name)
      .join(","),
  }));

  useEffect(() => {
    const name = form.watch("variantName");
    if (!name) return;

    form.setValue("size", "");
    const variant = variantsInfo.find((v) => v.variantName === name);
    if (variant) {
      const sizes_data = variant.sizes.map((s) => ({
        name: s.size,
        value: s.size,
      }));
      setActiveVariant(variant);
      setSizes(sizes_data);
      form.setValue(
        "color",
        variant.colors
          .map((c) => c.name)
          .filter((colorName) => !!colorName)
          .join(",")
      );
    }
  }, [form, variantsInfo]);

  return (
    <div>
      <div className="p-4 bg-primary-light rounded-xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="flex flex-col space-y-4">
              {/* Title */}
              <div className="pt-4">
                <h1 className="font-bold text-2xl">Add a review</h1>
              </div>
              {/* Form items */}
              <div className="flex flex-col gap-3">
              <FormField
                control={form.control as any}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex items-center gap-x-2">
                          <StarRating
                            count={5}
                            size={40}
                            color1="#e2dfdf"
                            color2="#95CFB2"
                            value={Number(field.value) || 0}
                            onChange={field.onChange}
                            half
                            edit
                          />
                          <span>
                            ({" "}
                            {Number(form.getValues().rating ?? 0).toFixed(1)} out
                            of 5.0)
                          </span>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="w-full flex flex-wrap gap-x-4">
                  <div className="flex items-center flex-wrap gap-2">
                    <FormField
                      control={form.control as any}
                      name="variantName"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Select
                              name={field.name}
                              value={field.value ?? ""}
                              onChange={field.onChange}
                              options={variants}
                              placeholder="Select product"
                              subPlaceholder="Please select a product"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control as any}
                    name="size"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Select
                            name={field.name}
                            value={field.value ?? ""}
                            onChange={field.onChange}
                            options={sizes}
                            placeholder="Select size"
                            subPlaceholder="Please select a size"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            name={field.name}
                            type="number"
                            placeholder="Quantity (Optional)"
                            onChange={(e) => {
                              field.onChange(e.target.value);
                            }}
                            value={field.value ?? ""} // Handle undefined gracefully
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control as any}
                  name="review"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <textarea
                          className="min-h-32 p-4 w-full rounded-xl focus:outline-none ring-1 ring-[transparent] focus:ring-accent"
                          placeholder="Write your review..."
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control as any}
                  name="images"
                  render={({ field }) => (
                    <FormItem className="w-full xl:border-r">
                      <FormControl>
                        <ImageUploadStore
                          value={(field.value ?? []).map((image: { url: string }) => image.url)}
                          disabled={isLoading}
                          onChange={(url) => {
                            setImages((prevImages) => {
                              const updatedImages = [...prevImages, { url }];
                              if (updatedImages.length <= 3) {
                                field.onChange(updatedImages);
                                return updatedImages;
                              } else {
                                return prevImages;
                              }
                            });
                          }}
                          onRemove={(url) =>
                            field.onChange(
                              (field.value ?? []).filter(
                                (current: { url: string }) => current.url !== url
                              )
                            )
                          }
                          maxImages={3}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <div className="space-y-2 text-destructive">
                {errors.rating && (
                  <p>{String(errors.rating.message ?? "")}</p>
                )}
                {errors.size && <p>{String(errors.size.message ?? "")}</p>}
                {errors.review && (
                  <p>{String(errors.review.message ?? "")}</p>
                )}
              </div>
              <div className="w-full flex justify-end">
                <Button type="submit" className="w-36 h-12">
                  {isLoading ? (
                    <PulseLoader size={5} color="#fff" />
                  ) : (
                    "Submit Review"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}