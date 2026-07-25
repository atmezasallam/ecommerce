"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CldUploadWidget } from "next-cloudinary";
import {
  Bug,
  CreditCard,
  Flag,
  HelpCircle,
  ImageIcon,
  Loader2,
  MessageSquareWarning,
  Package,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { reportProblem } from "@/src/app/actions/user.actions";
import { CLOUDINARY_UPLOAD_PRESET } from "@/src/lib/cloudinary-config";
import { AccountBreadcrumbs } from "@/src/components/user/account-breadcrumbs";
import { AccountPageHero } from "@/src/components/user/account-page-hero";
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
import { Textarea } from "@/src/components/ui/textarea";
import { cn } from "@/src/lib/utils";

const problemTypes = [
  { id: "bug", label: "Bug / Technical Issue", icon: Bug, emoji: "🐛" },
  { id: "payment", label: "Payment Problem", icon: CreditCard, emoji: "💳" },
  { id: "seller", label: "Seller Complaint", icon: MessageSquareWarning, emoji: "🏪" },
  { id: "delivery", label: "Delivery Issue", icon: Package, emoji: "📦" },
  { id: "security", label: "Account / Security", icon: Shield, emoji: "🔐" },
  { id: "content", label: "Inappropriate Content", icon: Flag, emoji: "💬" },
  { id: "other", label: "Other", icon: HelpCircle, emoji: "❓" },
] as const;

const reportSchema = z.object({
  type: z.string().min(1, "Select a problem type"),
  subject: z.string().min(5).max(100),
  description: z.string().min(30, "Please add more detail (min 30 characters)"),
  contactEmail: z.string().email(),
});

type ReportFormValues = z.infer<typeof reportSchema>;

export function ReportClient() {
  const [isPending, startTransition] = useTransition();
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      type: "",
      subject: "",
      description: "",
      contactEmail: "",
    },
  });

  const selectedType = form.watch("type");

  function onSubmit(values: ReportFormValues) {
    startTransition(async () => {
      const res = await reportProblem({
        type: values.type,
        subject: values.subject,
        description:
          values.description + (screenshotUrl ? `\n\nScreenshot: ${screenshotUrl}` : ""),
        contactEmail: values.contactEmail,
      });
      if (res.success) {
        setReference(crypto.randomUUID());
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    });
  }

  if (reference) {
    return (
      <>
        <AccountBreadcrumbs pageName="Report a Problem" />
        <AccountPageHero
          icon={Flag}
          title="Report a problem"
          subtitle="Thanks for taking the time to help us improve Salamo."
        />
        <Card className="overflow-hidden">
          <CardContent className="flex flex-col items-center gap-6 py-14 text-center">
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600"
            >
              <motion.svg
                viewBox="0 0 24 24"
                className="h-10 w-10"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.15 }}
              >
                <motion.path d="M5 13l4 4L19 7" />
              </motion.svg>
            </motion.div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Thank you!</h2>
              <p className="max-w-md text-sm text-muted-foreground">
                We&apos;ll look into this within 24 hours. Reference:{" "}
                <span className="font-mono text-foreground">{reference}</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <AccountBreadcrumbs pageName="Report a Problem" />
      <AccountPageHero
        icon={Flag}
        title="Report a problem"
        subtitle="Choose what went wrong, then describe it — our team reads every submission."
      />

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>What kind of issue is this?</CardTitle>
          <CardDescription>Tap the option that fits best. You can refine details below.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
            {problemTypes.map(({ id, label, icon: Icon, emoji }) => {
            const active = selectedType === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => form.setValue("type", id, { shouldValidate: true })}
                className={cn(
                  "flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all",
                  active ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/40"
                )}
              >
                <span className="text-2xl" aria-hidden>
                  {emoji}
                </span>
                <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />
                <span className="font-medium leading-snug">{label}</span>
              </button>
            );
          })}
          {form.formState.errors.type ? (
            <p className="text-sm font-medium text-destructive pt-2">
              {form.formState.errors.type.message}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <CardDescription>The more context you share, the faster we can help.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input placeholder="Short summary" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Steps to reproduce, order IDs, screenshots you mention, etc."
                        className="min-h-[140px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Screenshot (optional)
                </Label>
                <CldUploadWidget
                  uploadPreset={CLOUDINARY_UPLOAD_PRESET}
                  onSuccess={(result) => {
                    const info = result?.info;
                    const url =
                      typeof info === "object" && info && "secure_url" in info
                        ? String((info as { secure_url: string }).secure_url)
                        : "";
                    if (url) setScreenshotUrl(url);
                  }}
                >
                  {({ open }) => (
                    <Button type="button" variant="outline" onClick={() => open()}>
                      Upload screenshot
                    </Button>
                  )}
                </CldUploadWidget>
                {screenshotUrl && (
                  <p className="truncate text-xs text-muted-foreground">Attached: {screenshotUrl}</p>
                )}
              </div>

              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  "Submit report"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
}
