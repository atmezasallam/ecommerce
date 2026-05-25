import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AccountBreadcrumbs } from "@/src/components/user/account-breadcrumbs";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";

type HelpTopicShellProps = {
  title: string;
  pageName: string;
  children: ReactNode;
};

export function HelpTopicShell({ title, pageName, children }: HelpTopicShellProps) {
  return (
    <>
      <AccountBreadcrumbs pageName={pageName} />
      <div className="mb-6 flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild className="-ml-2 gap-1">
          <Link href="/help-center">
            <ArrowLeft className="h-4 w-4" />
            All topics
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{title}</CardTitle>
        </CardHeader>
        <CardContent className="max-w-none space-y-4 text-sm leading-relaxed text-muted-foreground">
          {children}
        </CardContent>
      </Card>
    </>
  );
}
