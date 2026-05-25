"use client";

import { useMemo, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CldUploadWidget } from "next-cloudinary";
import { CheckCircle2, Loader2, Scale } from "lucide-react";
import { toast } from "sonner";
import { submitDispute } from "@/src/app/actions/user.actions";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Textarea } from "@/src/components/ui/textarea";

const disputeReasons = [
  "Item not received",
  "Item not as described",
  "Wrong item sent",
  "Damaged item",
  "Refund not received",
  "Other",
] as const;

const disputeFormSchema = z.object({
  orderNumber: z.string().min(1, "Required"),
  reason: z.enum(disputeReasons),
  description: z.string().min(50, "Please provide details (min 50 chars)"),
  contactEmail: z.string().email(),
});

type DisputeFormValues = z.infer<typeof disputeFormSchema>;

export function DisputeClient() {
  const [isPending, startTransition] = useTransition();
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>([]);
  const [ticketId, setTicketId] = useState<string | null>(null);

  const form = useForm<DisputeFormValues>({
    resolver: zodResolver(disputeFormSchema),
    defaultValues: {
      orderNumber: "",
      reason: "Item not received",
      description: "",
      contactEmail: "",
    },
  });

  const steps = useMemo(
    () => [
      { label: "Submit", description: "Share order details" },
      { label: "Review", description: "Salamo investigates" },
      { label: "Resolved", description: "Outcome by email" },
    ],
    []
  );

  function onSubmit(values: DisputeFormValues) {
    startTransition(async () => {
      const res = await submitDispute({
        orderNumber: values.orderNumber,
        reason: values.reason,
        description: values.description,
        contactEmail: values.contactEmail,
      });
      if (res.success) {
        setTicketId(crypto.randomUUID());
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    });
  }

  if (ticketId) {
    return (
      <>
        <AccountBreadcrumbs pageName="Order Dispute Resolution" />
        <AccountPageHero
          icon={Scale}
          title="Order dispute resolution"
          subtitle="We’ve received your case and assigned a reference number."
        />
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardHeader className="flex flex-row items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-8 w-8 shrink-0 text-emerald-600" />
            <div>
              <CardTitle>Dispute submitted</CardTitle>
              <CardDescription>
                Your dispute <span className="font-mono font-medium text-foreground">#{ticketId}</span> has been
                submitted. We&apos;ll respond within 48 hours at the email you provided.
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      </>
    );
  }

  return (
    <>
      <AccountBreadcrumbs pageName="Order Dispute Resolution" />
      <AccountPageHero
        icon={Scale}
        title="Order dispute resolution"
        subtitle="Escalate an order issue when you and the seller cannot agree."
      />

      <Card className="mb-8 border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-base">How it works</CardTitle>
          <CardDescription>Three simple stages — most cases close within a few business days.</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="grid gap-4 md:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.label} className="flex gap-3 rounded-xl border bg-background/80 p-4 shadow-sm">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {i + 1}
                </span>
                <div>
                  <p className="font-medium">{s.label}</p>
                  <p className="text-sm text-muted-foreground">{s.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Open a dispute</CardTitle>
          <CardDescription>
            Include your order number and as much detail as possible. Optional photo evidence helps us decide faster.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="orderNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. SM-102938" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a reason" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {disputeReasons.map((r) => (
                          <SelectItem key={r} value={r}>
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                        placeholder="What happened? Include dates, tracking details, and what outcome you expect."
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
                <Label>Evidence (optional)</Label>
                <CldUploadWidget
                  uploadPreset="salam7778"
                  onSuccess={(result) => {
                    const info = result?.info;
                    const url =
                      typeof info === "object" && info && "secure_url" in info
                        ? String((info as { secure_url: string }).secure_url)
                        : "";
                    if (url) setEvidenceUrls((prev) => [...prev, url]);
                  }}
                >
                  {({ open }) => (
                    <Button type="button" variant="outline" onClick={() => open()}>
                      Upload file
                    </Button>
                  )}
                </CldUploadWidget>
                {evidenceUrls.length > 0 && (
                  <ul className="flex flex-wrap gap-2 pt-2">
                    {evidenceUrls.map((u) => (
                      <li key={u}>
                        <Badge variant="secondary" className="max-w-[220px] truncate font-normal">
                          {u}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="text-xs text-muted-foreground">
                  Evidence URLs are stored in this form for your records; backend persistence ships in a later
                  release.
                </p>
              </div>

              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  "Submit dispute"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
}
