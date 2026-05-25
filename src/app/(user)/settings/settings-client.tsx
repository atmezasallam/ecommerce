"use client";

import { useState, useTransition } from "react";
import { Settings } from "lucide-react";
import { toast } from "sonner";
import { updateSettings, type AccountSettingsState } from "@/src/app/actions/user.actions";
import { AccountBreadcrumbs } from "@/src/components/user/account-breadcrumbs";
import { AccountPageHero } from "@/src/components/user/account-page-hero";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Label } from "@/src/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/src/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Switch } from "@/src/components/ui/switch";

type SettingsClientProps = {
  initial: AccountSettingsState;
};

export function SettingsClient({ initial }: SettingsClientProps) {
  const [isPending, startTransition] = useTransition();
  const [settings, setSettings] = useState<AccountSettingsState>(initial);

  function persist(patch: Partial<AccountSettingsState>) {
    const prev = settings;
    const next: AccountSettingsState = { ...settings, ...patch };
    setSettings(next);
    startTransition(async () => {
      const res = await updateSettings({
        emailNotifications: next.emailNotifications,
        smsNotifications: next.smsNotifications,
        language: next.language,
        currency: next.currency,
        pushNotifications: next.pushNotifications,
        newsletterPromotions: next.newsletterPromotions,
        showProfileToSellers: next.showProfileToSellers,
        personalizedRecommendations: next.personalizedRecommendations,
      });
      if (!res.success) {
        setSettings(prev);
        toast.error("Could not save settings.");
      }
    });
  }

  return (
    <>
      <AccountBreadcrumbs pageName="Settings" />
      <AccountPageHero
        icon={Settings}
        title="Account settings"
        subtitle="Control notifications, preferences, and privacy for your Salamo account."
      />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Choose how Salamo reaches you about orders and offers.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label htmlFor="email-notif">Email notifications</Label>
                <p className="text-sm text-muted-foreground">Orders, offers, and important updates.</p>
              </div>
              <Switch
                id="email-notif"
                checked={settings.emailNotifications}
                disabled={isPending}
                onCheckedChange={(v) => persist({ emailNotifications: v })}
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label htmlFor="sms-notif">SMS notifications</Label>
                <p className="text-sm text-muted-foreground">Delivery and order alerts by text.</p>
              </div>
              <Switch
                id="sms-notif"
                checked={settings.smsNotifications}
                disabled={isPending}
                onCheckedChange={(v) => persist({ smsNotifications: v })}
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label htmlFor="push-notif">Push notifications</Label>
                <p className="text-sm text-muted-foreground">Real-time alerts in your browser (when enabled).</p>
              </div>
              <Switch
                id="push-notif"
                checked={settings.pushNotifications}
                disabled={isPending}
                onCheckedChange={(v) => persist({ pushNotifications: v })}
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label htmlFor="newsletter">Newsletter &amp; promotions</Label>
                <p className="text-sm text-muted-foreground">Tips, seasonal sales, and partner offers.</p>
              </div>
              <Switch
                id="newsletter"
                checked={settings.newsletterPromotions}
                disabled={isPending}
                onCheckedChange={(v) => persist({ newsletterPromotions: v })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Language and currency for browsing Salamo.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Language</Label>
              <Select
                value={settings.language}
                disabled={isPending}
                onValueChange={(language) => persist({ language })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Arabic">Arabic</SelectItem>
                  <SelectItem value="Turkish">Turkish</SelectItem>
                  <SelectItem value="French">French</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select
                value={settings.currency}
                disabled={isPending}
                onValueChange={(currency) => persist({ currency })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="ILS">ILS</SelectItem>
                  <SelectItem value="TRY">TRY</SelectItem>
                  <SelectItem value="SAR">SAR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Privacy</CardTitle>
            <CardDescription>Control how your activity shapes your experience.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label htmlFor="show-profile">Show my profile to sellers</Label>
                <p className="text-sm text-muted-foreground">Let sellers see your public display name on messages.</p>
              </div>
              <Switch
                id="show-profile"
                checked={settings.showProfileToSellers}
                disabled={isPending}
                onCheckedChange={(v) => persist({ showProfileToSellers: v })}
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label htmlFor="personalized">Allow personalized recommendations</Label>
                <p className="text-sm text-muted-foreground">Tailor home and search results to your interests.</p>
              </div>
              <Switch
                id="personalized"
                checked={settings.personalizedRecommendations}
                disabled={isPending}
                onCheckedChange={(v) => persist({ personalizedRecommendations: v })}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">Danger zone</CardTitle>
            <CardDescription>Irreversible actions for your Salamo account.</CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete account</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. Please contact Salamo support if you need to close your account
                    permanently.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction disabled>Contact support</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
