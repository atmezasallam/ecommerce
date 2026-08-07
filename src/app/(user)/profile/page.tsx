import { getProfilePageData } from "@/src/app/actions/user.actions";

export const dynamic = "force-dynamic";
import { ProfileClient } from "./profile-client";
import { AccountBreadcrumbs } from "@/src/components/user/account-breadcrumbs";
import { AccountPageHero } from "@/src/components/user/account-page-hero";
import { Card, CardContent } from "@/src/components/ui/card";
import { Skeleton } from "@/src/components/ui/skeleton";
import { User } from "lucide-react";

export default async function ProfilePage() {
  const { user } = await getProfilePageData();

  if (!user) {
    return (
      <>
        <AccountBreadcrumbs pageName="Profile" />
        <AccountPageHero
          icon={User}
          title="My Profile"
          subtitle="We could not load your Salamo profile yet."
        />
        <Card>
          <CardContent className="space-y-3 pt-6">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <p className="text-sm text-muted-foreground">
              Add a verified email to your Clerk account, then refresh this page.
            </p>
          </CardContent>
        </Card>
      </>
    );
  }

  return <ProfileClient user={user} />;
}
