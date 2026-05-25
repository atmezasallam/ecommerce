"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { Banner } from "@prisma/client";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { createBanner, updateBanner } from "@/src/app/actions/banner.actions";
import BannerSlide from "@/src/components/banners/BannerSlide";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Textarea } from "@/src/components/ui/textarea";
import type { BannerFormData } from "@/types/banner.types";

const SketchPicker = dynamic(
  () => import("react-color").then((m) => m.SketchPicker),
  { ssr: false }
);

const schema = z.object({
  title: z.string().max(100),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  image: z.string().min(1, "Image required"),
  mobileImage: z.string().optional(),
  bgColor: z.string().default("#000000"),
  textColor: z.string().default("#ffffff"),
  ctaText: z.string().optional(),
  ctaLink: z.string().optional(),
  ctaStyle: z.enum(["outline", "solid", "ghost"]),
  type: z.enum(["HERO", "ANNOUNCEMENT", "PROMOTIONAL"]),
  status: z.enum(["ACTIVE", "INACTIVE", "SCHEDULED"]),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type BannerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialBanner?: Banner;
  defaultType?: "HERO" | "ANNOUNCEMENT" | "PROMOTIONAL";
};

type CloudinaryUploadResponse = { secure_url?: string };

async function uploadToCloudinary(file: File): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_NAME;
  if (!cloudName || !preset) throw new Error("Missing Cloudinary env vars");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", preset);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Upload failed");
  const data = (await res.json()) as CloudinaryUploadResponse;
  if (!data.secure_url) throw new Error("Upload returned no URL");
  return data.secure_url;
}

export default function BannerDialog({
  open,
  onOpenChange,
  initialBanner,
  defaultType = "HERO",
}: BannerDialogProps) {
  const router = useRouter();
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const mobileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState<"image" | "mobile" | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      subtitle: "",
      description: "",
      image: "",
      mobileImage: "",
      bgColor: "#000000",
      textColor: "#ffffff",
      ctaText: "",
      ctaLink: "",
      ctaStyle: "outline",
      type: "HERO",
      status: "INACTIVE",
      startDate: "",
      endDate: "",
    },
  });

  useEffect(() => {
    if (!initialBanner) return;
    form.reset({
      title: initialBanner.title,
      subtitle: initialBanner.subtitle ?? "",
      description: initialBanner.description ?? "",
      image: initialBanner.image,
      mobileImage: initialBanner.mobileImage ?? "",
      bgColor: initialBanner.bgColor,
      textColor: initialBanner.textColor,
      ctaText: initialBanner.ctaText ?? "",
      ctaLink: initialBanner.ctaLink ?? "",
      ctaStyle: (initialBanner.ctaStyle as "outline" | "solid" | "ghost") ?? "outline",
      type: initialBanner.type,
      status: initialBanner.status,
      startDate: initialBanner.startDate ? new Date(initialBanner.startDate).toISOString().slice(0, 16) : "",
      endDate: initialBanner.endDate ? new Date(initialBanner.endDate).toISOString().slice(0, 16) : "",
    });
  }, [initialBanner, form]);

  useEffect(() => {
    if (!open || initialBanner) return;
    form.setValue("type", defaultType);
  }, [open, initialBanner, defaultType, form]);

  const preview = useMemo(
    () =>
      ({
        id: initialBanner?.id ?? "preview",
        title: form.watch("title") ?? "",
        subtitle: form.watch("subtitle") || null,
        description: form.watch("description") || null,
        image: form.watch("image") || "https://images.unsplash.com/photo-1483985988355-763728e1935b",
        mobileImage: form.watch("mobileImage") || null,
        bgColor: form.watch("bgColor"),
        textColor: form.watch("textColor"),
        ctaText: form.watch("ctaText") || null,
        ctaLink: form.watch("ctaLink") || null,
        ctaStyle: form.watch("ctaStyle"),
        type: form.watch("type"),
        status: form.watch("status"),
        position: initialBanner?.position ?? 0,
        startDate: form.watch("startDate") ? new Date(form.watch("startDate") as string) : null,
        endDate: form.watch("endDate") ? new Date(form.watch("endDate") as string) : null,
        clicks: initialBanner?.clicks ?? 0,
        impressions: initialBanner?.impressions ?? 0,
        createdAt: initialBanner?.createdAt ?? new Date(),
        updatedAt: initialBanner?.updatedAt ?? new Date(),
      }) as Banner,
    [form, initialBanner]
  );

  const onSubmit = async (values: FormValues) => {
    if (values.startDate && values.endDate) {
      const start = new Date(values.startDate);
      const end = new Date(values.endDate);
      if (end < start) {
        toast.error("End date must be after start date.");
        return;
      }
    }

    const payload: BannerFormData = {
      title: values.title.trim(),
      subtitle: values.subtitle || undefined,
      description: values.description || undefined,
      image: values.image,
      mobileImage: values.mobileImage || undefined,
      bgColor: values.bgColor,
      textColor: values.textColor,
      ctaText: values.ctaText || undefined,
      ctaLink: values.ctaLink || undefined,
      ctaStyle: values.ctaStyle,
      type: values.type,
      status: values.status,
      startDate: values.startDate ? new Date(values.startDate) : undefined,
      endDate: values.endDate ? new Date(values.endDate) : undefined,
    };

    try {
      if (initialBanner) {
        await updateBanner(initialBanner.id, payload);
        toast.success("Banner updated");
      } else {
        await createBanner(payload);
        toast.success("Banner created");
      }
      router.refresh();
      onOpenChange(false);
      form.reset();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong.";
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle>{initialBanner ? "Edit Banner" : "Add Banner"}</DialogTitle>
          <DialogDescription>Manage hero and promotional banner content.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel>Title (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Leave empty for image-only banner" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="subtitle" render={({ field }) => (
                <FormItem><FormLabel>Subtitle</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>
              )} />

              <FormField control={form.control} name="image" render={({ field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <div className="flex items-center gap-3">
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          setUploading("image");
                          const url = await uploadToCloudinary(file);
                          field.onChange(url);
                          toast.success("Image uploaded");
                        } catch (err) {
                          toast.error(err instanceof Error ? err.message : "Upload failed");
                        } finally {
                          setUploading(null);
                          e.target.value = "";
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={uploading !== null}
                      onClick={() => imageInputRef.current?.click()}
                    >
                      {uploading === "image" ? "Uploading..." : "Upload Image"}
                    </Button>
                    {field.value ? (
                      <Image
                        src={field.value}
                        alt="banner"
                        width={160}
                        height={90}
                        quality={100}
                        className="rounded-md border object-cover"
                      />
                    ) : null}
                  </div>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="mobileImage" render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile Image</FormLabel>
                  <div className="flex items-center gap-3">
                    <input
                      ref={mobileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          setUploading("mobile");
                          const url = await uploadToCloudinary(file);
                          field.onChange(url);
                          toast.success("Mobile image uploaded");
                        } catch (err) {
                          toast.error(err instanceof Error ? err.message : "Upload failed");
                        } finally {
                          setUploading(null);
                          e.target.value = "";
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={uploading !== null}
                      onClick={() => mobileInputRef.current?.click()}
                    >
                      {uploading === "mobile" ? "Uploading..." : "Upload Mobile"}
                    </Button>
                    {field.value ? (
                      <Image
                        src={field.value}
                        alt="mobile banner"
                        width={160}
                        height={90}
                        quality={100}
                        className="rounded-md border object-cover"
                      />
                    ) : null}
                  </div>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="bgColor" render={({ field }) => (
                  <FormItem><FormLabel>Background color</FormLabel><FormControl><SketchPicker color={field.value} onChange={(v) => field.onChange(v.hex)} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="textColor" render={({ field }) => (
                  <FormItem><FormLabel>Text color</FormLabel><FormControl><SketchPicker color={field.value} onChange={(v) => field.onChange(v.hex)} /></FormControl></FormItem>
                )} />
              </div>

              <FormField control={form.control} name="ctaText" render={({ field }) => (
                <FormItem><FormLabel>CTA text</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="ctaLink" render={({ field }) => (
                <FormItem><FormLabel>CTA link</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
              )} />

              <FormField control={form.control} name="ctaStyle" render={({ field }) => (
                <FormItem>
                  <FormLabel>CTA style</FormLabel>
                  <FormControl>
                    <RadioGroup value={field.value} onValueChange={field.onChange} className="flex gap-4">
                      <div className="flex items-center gap-2"><RadioGroupItem value="outline" id="outline" /><label htmlFor="outline">Outline</label></div>
                      <div className="flex items-center gap-2"><RadioGroupItem value="solid" id="solid" /><label htmlFor="solid">Solid</label></div>
                      <div className="flex items-center gap-2"><RadioGroupItem value="ghost" id="ghost" /><label htmlFor="ghost">Ghost</label></div>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )} />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="type" render={({ field }) => (
                  <FormItem><FormLabel>Type</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="HERO">HERO</SelectItem><SelectItem value="ANNOUNCEMENT">ANNOUNCEMENT</SelectItem><SelectItem value="PROMOTIONAL">PROMOTIONAL</SelectItem></SelectContent></Select></FormItem>
                )} />
                <FormField control={form.control} name="status" render={({ field }) => (
                  <FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="ACTIVE">ACTIVE</SelectItem><SelectItem value="INACTIVE">INACTIVE</SelectItem><SelectItem value="SCHEDULED">SCHEDULED</SelectItem></SelectContent></Select></FormItem>
                )} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="startDate" render={({ field }) => (
                  <FormItem><FormLabel>Start date</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="endDate" render={({ field }) => (
                  <FormItem><FormLabel>End date</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl></FormItem>
                )} />
              </div>

              <Button type="submit" disabled={form.formState.isSubmitting}>
                {initialBanner ? "Save changes" : "Create banner"}
              </Button>
            </form>
          </Form>

          <div>
            <p className="mb-2 text-sm font-semibold">Preview</p>
            <div className="overflow-hidden rounded-md border">
              <div className="pointer-events-none w-full">
                <BannerSlide banner={preview} />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
