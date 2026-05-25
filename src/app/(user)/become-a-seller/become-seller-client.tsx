"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import slugify from "slugify";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  Clock,
  Loader2,
  Store,
} from "lucide-react";
import { toast } from "sonner";
import {
  checkStoreUrlAvailable,
  submitSellerApplication,
} from "@/src/app/actions/user.actions";
import { AccountBreadcrumbs } from "@/src/components/user/account-breadcrumbs";
import { AccountPageHero } from "@/src/components/user/account-page-hero";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Checkbox } from "@/src/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { Progress } from "@/src/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Textarea } from "@/src/components/ui/textarea";

const COUNTRIES = [
  "Palestinian Territory",
  "Jordan",
  "Lebanon",
  "Saudi Arabia",
  "United Arab Emirates",
  "Turkey",
  "France",
  "United States",
  "United Kingdom",
  "Other",
] as const;

const step1Schema = z.object({
  storeName: z.string().min(3).max(50),
  storeUrl: z.string().min(2).max(60),
  storeCategory: z.string().min(1, "Choose a category"),
  storeDescription: z.string().min(50).max(5000),
});

const step2Schema = z.object({
  storeEmail: z.string().email(),
  storePhone: z.string().min(5).max(30),
  country: z.string().min(1),
});

const step3Schema = z.object({
  agreeTerms: z.boolean().refine((v) => v === true, { message: "Required" }),
  agreeSeller: z.boolean().refine((v) => v === true, { message: "Required" }),
});

type Step1 = z.infer<typeof step1Schema>;
type Step2 = z.infer<typeof step2Schema>;
type Step3 = z.infer<typeof step3Schema>;

type StoreRow = {
  id: string;
  name: string;
  url: string;
  email: string;
  phone: string;
  status: "PENDING" | "ACTIVE" | "BANNED" | "DISABLED";
  description: string;
};

type CategoryRow = { id: string; name: string; url: string };

type BecomeSellerClientProps = {
  initialStore: StoreRow | null;
  categories: CategoryRow[];
  becomeSellerPageAbsoluteUrl: string;
};

function PageLocationHint({ url }: { url: string }) {
  return (
    <p className="mt-4 rounded-lg border bg-muted/40 px-3 py-2 text-left text-xs text-muted-foreground">
      <span className="font-medium text-foreground">You already have a store — </span>
      bookmark this page:{" "}
      <span className="mt-1 block break-all font-mono text-primary">{url}</span>
    </p>
  );
}

export function BecomeSellerClient({
  initialStore,
  categories,
  becomeSellerPageAbsoluteUrl,
}: BecomeSellerClientProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [urlOk, setUrlOk] = useState<boolean | null>(null);
  const [urlChecking, setUrlChecking] = useState(false);
  const [showSuccessBurst, setShowSuccessBurst] = useState(false);
  const [handleTouched, setHandleTouched] = useState(false);

  const [s1, setS1] = useState<Partial<Step1>>({});
  const [s2, setS2] = useState<Partial<Step2>>({});

  const form1 = useForm<Step1>({ resolver: zodResolver(step1Schema), defaultValues: {} });
  const form2 = useForm<Step2>({ resolver: zodResolver(step2Schema), defaultValues: {} });
  const form3 = useForm<Step3>({
    resolver: zodResolver(step3Schema),
    defaultValues: { agreeTerms: false, agreeSeller: false },
  });

  const progress = step === 1 ? 33 : step === 2 ? 66 : 100;

  const verifyUrl = useCallback(async (raw: string) => {
    const normalized = slugify(raw.trim(), { lower: true, strict: true, trim: true });
    if (!normalized) {
      setUrlOk(false);
      return;
    }
    setUrlChecking(true);
    try {
      const res = await checkStoreUrlAvailable(normalized);
      setUrlOk(res.available);
      if (res.normalized) {
        form1.setValue("storeUrl", res.normalized, { shouldValidate: true });
      }
    } finally {
      setUrlChecking(false);
    }
  }, [form1]);

  const storeUrlWatch = form1.watch("storeUrl");
  const storeNameWatch = form1.watch("storeName");

  useEffect(() => {
    if (handleTouched) return;
    if (!storeNameWatch) return;
    const auto = slugify(storeNameWatch, { lower: true, strict: true, trim: true });
    if (auto) {
      form1.setValue("storeUrl", auto, { shouldValidate: true });
    }
  }, [storeNameWatch, handleTouched, form1]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (storeUrlWatch) void verifyUrl(storeUrlWatch);
      else setUrlOk(null);
    }, 450);
    return () => clearTimeout(t);
  }, [storeUrlWatch, verifyUrl]);

  const particles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        x: Math.random() * 200 - 100,
        y: Math.random() * 200 - 100,
        delay: Math.random() * 0.3,
      })),
    []
  );

  if (initialStore?.status === "ACTIVE") {
    return (
      <>
        <AccountBreadcrumbs pageName="Become a Seller" />
        <AccountPageHero
          icon={Store}
          title="Become a seller"
          subtitle="You are approved to sell on Salamo."
        />
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <BadgeCheck className="h-16 w-16 text-emerald-600" aria-hidden />
            <h2 className="text-xl font-semibold">You already have a store</h2>
            <p className="max-w-md text-muted-foreground">
              You&apos;re approved to sell on Salamo. Open your seller dashboard to manage products, orders, and
              your storefront.
            </p>
            <PageLocationHint url={becomeSellerPageAbsoluteUrl} />
            <Button asChild>
              <Link href="/dashboard/seller">Go to seller dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </>
    );
  }

  if (initialStore?.status === "PENDING") {
    return (
      <>
        <AccountBreadcrumbs pageName="Become a Seller" />
        <AccountPageHero
          icon={Store}
          title="Become a seller"
          subtitle="Track your application status."
        />
        <Card className="border-amber-500/40 bg-amber-500/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Clock className="h-10 w-10 text-amber-600" aria-hidden />
              <div>
                <CardTitle>Application under review</CardTitle>
                <CardDescription>
                  You already have a store on file — we&apos;re reviewing your application. We&apos;ll notify you
                  within 2–3 business days.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="font-medium text-foreground">Store name:</span> {initialStore.name}
            </p>
            <p>
              <span className="font-medium text-foreground">Store URL:</span> /store/{initialStore.url}
            </p>
            <p>
              <span className="font-medium text-foreground">Contact email:</span> {initialStore.email}
            </p>
            <p>
              <span className="font-medium text-foreground">Phone:</span> {initialStore.phone}
            </p>
            <Badge variant="secondary" className="mt-2">
              Status: Pending
            </Badge>
            <PageLocationHint url={becomeSellerPageAbsoluteUrl} />
          </CardContent>
        </Card>
      </>
    );
  }

  if (initialStore && (initialStore.status === "BANNED" || initialStore.status === "DISABLED")) {
    return (
      <>
        <AccountBreadcrumbs pageName="Become a Seller" />
        <AccountPageHero
          icon={Store}
          title="Become a seller"
          subtitle="Your seller access needs attention."
        />
        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle>You already have a store</CardTitle>
            <CardDescription>
              This store is marked as {initialStore.status.toLowerCase()}. Please contact Salamo support for help.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PageLocationHint url={becomeSellerPageAbsoluteUrl} />
          </CardContent>
        </Card>
      </>
    );
  }

  function nextFromStep1(values: Step1) {
    setS1(values);
    setStep(2);
  }

  function nextFromStep2(values: Step2) {
    setS2(values);
    setStep(3);
  }

  function onFinalSubmit(values: Step3) {
    const merged1 = { ...s1, ...form1.getValues() } as Step1;
    const merged2 = { ...s2, ...form2.getValues() } as Step2;
    const parsed1 = step1Schema.safeParse(merged1);
    const parsed2 = step2Schema.safeParse(merged2);
    if (!parsed1.success || !parsed2.success) {
      toast.error("Please complete all steps.");
      setStep(1);
      return;
    }
    step3Schema.parse(values);

    const descriptionWithMeta = `${parsed1.data.storeDescription}\n\nCountry: ${parsed2.data.country}`;

    startTransition(async () => {
      const res = await submitSellerApplication({
        storeName: parsed1.data.storeName,
        storeUrl: parsed1.data.storeUrl,
        storeEmail: parsed2.data.storeEmail,
        storePhone: parsed2.data.storePhone,
        storeDescription: descriptionWithMeta,
        storeCategory: parsed1.data.storeCategory,
      });
      if (res.success) {
        setShowSuccessBurst(true);
        toast.success(res.message);
        setTimeout(() => {
          router.refresh();
        }, 1200);
      } else {
        toast.error(res.message);
      }
    });
  }

  return (
    <>
      <AccountBreadcrumbs pageName="Become a Seller" />
      <AccountPageHero
        icon={Store}
        title="Become a seller"
        subtitle="Open your shop on Salamo in three guided steps."
      />

      <div className="relative mb-6">
        <Progress value={progress} className="h-2" />
        <p className="mt-2 text-sm text-muted-foreground">Step {step} of 3</p>
      </div>

      {showSuccessBurst && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
          {particles.map((p) => (
            <motion.span
              key={p.id}
              className="absolute h-3 w-3 rounded-full bg-primary"
              initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
              animate={{
                opacity: 0,
                scale: 1.2,
                x: p.x,
                y: p.y,
              }}
              transition={{ duration: 0.9, delay: p.delay, ease: "easeOut" }}
            />
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.22 }}
        >
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Store information</CardTitle>
                <CardDescription>Tell shoppers who you are and what you sell.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form1}>
                  <form onSubmit={form1.handleSubmit(nextFromStep1)} className="space-y-6">
                    <FormField
                      control={form1.control}
                      name="storeName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Store name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Nablus Olive Goods" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form1.control}
                      name="storeUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Store URL / handle</FormLabel>
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <FormControl>
                              <Input
                                placeholder="your-store-handle"
                                {...field}
                                onChange={(e) => {
                                  setHandleTouched(true);
                                  field.onChange(e);
                                }}
                              />
                            </FormControl>
                            <div className="flex items-center gap-2 text-sm">
                              {urlChecking ? (
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                              ) : urlOk === true ? (
                                <span className="flex items-center gap-1 text-emerald-600">
                                  <Check className="h-4 w-4" /> Available
                                </span>
                              ) : urlOk === false ? (
                                <span className="text-destructive">Not available</span>
                              ) : null}
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form1.control}
                      name="storeCategory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Store category</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((c) => (
                                <SelectItem key={c.id} value={c.name}>
                                  {c.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form1.control}
                      name="storeDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Store description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe your shop, sourcing, and what customers can expect (min. 50 characters)."
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end">
                      <Button type="submit">
                        Next
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Contact details</CardTitle>
                <CardDescription>How buyers and Salamo can reach your business.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form2}>
                  <form onSubmit={form2.handleSubmit(nextFromStep2)} className="space-y-6">
                    <FormField
                      control={form2.control}
                      name="storeEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="you@business.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form2.control}
                      name="storePhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone number</FormLabel>
                          <FormControl>
                            <Input placeholder="+970 …" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form2.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country / region</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select country" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {COUNTRIES.map((c) => (
                                <SelectItem key={c} value={c}>
                                  {c}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-between">
                      <Button type="button" variant="outline" onClick={() => setStep(1)}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                      </Button>
                      <Button type="submit">
                        Next
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Review &amp; submit</CardTitle>
                <CardDescription>Confirm your details before we review your application.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-xl border bg-muted/30 p-4 text-sm space-y-2">
                  <p>
                    <span className="font-medium">Store:</span> {form1.getValues("storeName") || s1.storeName}
                  </p>
                  <p>
                    <span className="font-medium">URL:</span>{" "}
                    {form1.getValues("storeUrl") || s1.storeUrl}
                  </p>
                  <p>
                    <span className="font-medium">Category:</span>{" "}
                    {form1.getValues("storeCategory") || s1.storeCategory}
                  </p>
                  <p className="whitespace-pre-wrap">
                    <span className="font-medium">Description:</span>{" "}
                    {form1.getValues("storeDescription") || s1.storeDescription}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span> {form2.getValues("storeEmail") || s2.storeEmail}
                  </p>
                  <p>
                    <span className="font-medium">Phone:</span> {form2.getValues("storePhone") || s2.storePhone}
                  </p>
                  <p>
                    <span className="font-medium">Country:</span> {form2.getValues("country") || s2.country}
                  </p>
                </div>

                <Form {...form3}>
                  <form onSubmit={form3.handleSubmit(onFinalSubmit)} className="space-y-6">
                    <FormField
                      control={form3.control}
                      name="agreeTerms"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start gap-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(c) => field.onChange(c === true)}
                            />
                          </FormControl>
                          <div>
                            <FormLabel>I agree to the Terms &amp; Conditions</FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form3.control}
                      name="agreeSeller"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start gap-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(c) => field.onChange(c === true)}
                            />
                          </FormControl>
                          <div>
                            <FormLabel>I agree to the Salamo Seller Agreement</FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-between">
                      <Button type="button" variant="outline" onClick={() => setStep(2)}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                      </Button>
                      <Button type="submit" disabled={isPending}>
                        {isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting…
                          </>
                        ) : (
                          "Submit application"
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
