"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { HomepageBrand } from "@prisma/client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { createHomepageBrand, updateHomepageBrand } from "@/src/app/actions/homepage-brand.actions";
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
import { Switch } from "@/src/components/ui/switch";

const schema = z.object({
  name: z.string().min(1, "Name required").max(120),
  logo: z.string().min(1, "Logo required"),
  href: z.string().min(1).max(2000),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

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

type HomepageBrandDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: HomepageBrand;
};

export default function HomepageBrandDialog({ open, onOpenChange, initial }: HomepageBrandDialogProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      logo: "",
      href: "/browse",
      isActive: true,
    },
  });

  useEffect(() => {
    if (!open) return;
    if (initial) {
      form.reset({
        name: initial.name,
        logo: initial.logo,
        href: initial.href || "/browse",
        isActive: initial.isActive,
      });
    } else {
      form.reset({ name: "", logo: "", href: "/browse", isActive: true });
    }
  }, [open, initial, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (initial) {
        await updateHomepageBrand(initial.id, values);
        toast.success("Brand updated");
      } else {
        await createHomepageBrand(values);
        toast.success("Brand added");
      }
      onOpenChange(false);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit brand" : "Add brand"}</DialogTitle>
          <DialogDescription>Logo and link are shown on the homepage carousel.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Mango" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="logo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo</FormLabel>
                  <div className="flex flex-col gap-2">
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploading(true);
                        try {
                          const url = await uploadToCloudinary(file);
                          field.onChange(url);
                          toast.success("Logo uploaded");
                        } catch (err) {
                          toast.error(err instanceof Error ? err.message : "Upload failed");
                        } finally {
                          setUploading(false);
                          e.target.value = "";
                        }
                      }}
                    />
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" disabled={uploading} onClick={() => fileRef.current?.click()}>
                        {uploading ? "Uploading…" : "Upload image"}
                      </Button>
                    </div>
                    <FormControl>
                      <Input placeholder="Or paste image URL" {...field} />
                    </FormControl>
                    {field.value ? (
                      <div className="relative mt-1 h-20 w-full rounded-lg border bg-surface p-2">
                        <Image src={field.value} alt="Preview" fill className="object-contain p-1" unoptimized />
                      </div>
                    ) : null}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="href"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link</FormLabel>
                  <FormControl>
                    <Input placeholder="/browse?..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <FormLabel className="!mt-0">Visible on homepage</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting || uploading}>
                {initial ? "Save" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
