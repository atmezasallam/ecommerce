"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CldUploadWidget } from "next-cloudinary";
import { format } from "date-fns";
import { Loader2, Lock, User } from "lucide-react";
import { toast } from "sonner";
import { updateProfile } from "@/src/app/actions/user.actions";
import { CLOUDINARY_UPLOAD_PRESET } from "@/src/lib/cloudinary-config";
import { AccountBreadcrumbs } from "@/src/components/user/account-breadcrumbs";
import { AccountPageHero } from "@/src/components/user/account-page-hero";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Skeleton } from "@/src/components/ui/skeleton";

const profileSchema = z.object({
  name: z.string().min(2).max(50),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

type ProfileUser = {
  id: string;
  name: string;
  email: string;
  image_url: string | null;
  role: "USER" | "ADMIN" | "SELLER";
  createdAt: Date;
};

type ProfileClientProps = {
  user: ProfileUser;
};

export function ProfileClient({ user }: ProfileClientProps) {
  const { user: clerkUser, isLoaded } = useUser();
  const [isPending, startTransition] = useTransition();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user.image_url);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user.name },
  });

  const displayImage =
    avatarUrl ?? clerkUser?.imageUrl ?? user.image_url ?? undefined;
  const email = clerkUser?.primaryEmailAddress?.emailAddress ?? user.email;

  function onSubmit(values: ProfileFormValues) {
    startTransition(async () => {
      const res = await updateProfile({
        name: values.name,
        ...(avatarUrl ? { image_url: avatarUrl } : {}),
      });
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    });
  }

  return (
    <>
      <AccountBreadcrumbs pageName="Profile" />
      <AccountPageHero
        icon={User}
        title="My Profile"
        subtitle="Manage how you appear on Salamo and keep your details up to date."
      />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile photo</CardTitle>
            <CardDescription>Upload a clear photo — shoppers and sellers see this on Salamo.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border bg-muted">
              {displayImage ? (
                <Image src={displayImage} alt="" fill className="object-cover" sizes="96px" />
              ) : (
                <Skeleton className="h-full w-full rounded-full" />
              )}
            </div>
            {mounted ? (
              <CldUploadWidget
                uploadPreset={CLOUDINARY_UPLOAD_PRESET}
                onSuccess={(result) => {
                  const info = result?.info;
                  const url =
                    typeof info === "object" && info && "secure_url" in info
                      ? String((info as { secure_url: string }).secure_url)
                      : "";
                  if (!url) {
                    toast.error("Upload failed — no image URL returned.");
                    return;
                  }
                  setAvatarUrl(url);
                  startTransition(async () => {
                    const res = await updateProfile({
                      name: form.getValues("name"),
                      image_url: url,
                    });
                    if (res.success) {
                      toast.success("Photo updated.");
                    } else {
                      toast.error(res.message);
                    }
                  });
                }}
              >
                {({ open }) => (
                  <Button type="button" variant="outline" onClick={() => open()}>
                    Change photo
                  </Button>
                )}
              </CldUploadWidget>
            ) : (
              <Skeleton className="h-10 w-32" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Personal details</CardTitle>
            <CardDescription>Your name is stored in Salamo. Email is managed securely by Clerk.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your name" autoComplete="name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Email
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                  </Label>
                  <Input value={isLoaded ? email : ""} disabled readOnly className="bg-muted/50" />
                  <p className="text-xs text-muted-foreground">
                    Email sign-in and verification are handled in your Clerk account settings.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Member since</Label>
                    <Input
                      readOnly
                      disabled
                      className="bg-muted/50"
                      value={format(new Date(user.createdAt), "MMMM d, yyyy")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <div className="flex h-10 items-center">
                      <Badge variant={user.role === "SELLER" ? "default" : "secondary"}>
                        {user.role === "SELLER" ? "Seller" : user.role === "ADMIN" ? "Admin" : "Member"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    "Save changes"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
