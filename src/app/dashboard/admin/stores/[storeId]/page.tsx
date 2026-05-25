import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ArrowLeft, ExternalLink, Mail, Phone, Store } from "lucide-react";

import { db } from "@/src/lib/db";
import { isPlatformAdmin } from "@/src/lib/admin-access";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";

const statusClass: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
  ACTIVE: "bg-green-500/10 text-green-700 border-green-500/20",
  BANNED: "bg-red-500/10 text-red-700 border-red-500/20",
  DISABLED: "bg-base/10 text-subtle border-border/20",
};

export default async function AdminStoreDetailsPage({
  params,
}: {
  params: { storeId: string };
}) {
  const user = await currentUser();
  if (!user) {
    redirect("/");
  }

  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  if (!isPlatformAdmin(dbUser?.role, user.privateMetadata?.role)) {
    redirect("/");
  }

  const store = (await db.store.findUnique({
    where: { id: params.storeId },
    include: {
      user: {
        select: { name: true, email: true },
      },
      products: {
        select: { id: true, name: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 8,
      },
      followers: {
        select: { id: true },
      },
    },
  })) as
    | {
        id: string;
        name: string;
        url: string;
        email: string;
        phone: string;
        status: "PENDING" | "ACTIVE" | "BANNED" | "DISABLED";
        featured: boolean;
        createdAt: Date;
        user: { name: string; email: string };
        products: Array<{ id: string; name: string; createdAt: Date }>;
        followers: Array<{ id: string }>;
      }
    | null;

  if (!store) {
    redirect("/dashboard/admin/stores");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Button asChild variant="ghost" className="mb-2 px-0 hover:bg-transparent">
            <Link href="/dashboard/admin/stores">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to stores
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{store.name}</h1>
          <p className="text-muted-foreground">Admin store overview</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={statusClass[store.status] ?? ""}>
            {store.status}
          </Badge>
          {store.featured && <Badge variant="secondary">Featured</Badge>}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Store Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{store.url}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{store.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{store.phone}</span>
            </div>
            <p className="text-muted-foreground">Created: {store.createdAt.toLocaleDateString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Owner</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="font-medium">{store.user.name}</p>
            <p className="text-muted-foreground">{store.user.email}</p>
            <p className="pt-2 text-xs text-muted-foreground">
              Followers: <span className="font-medium text-foreground">{store.followers.length}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Products: <span className="font-medium text-foreground">{store.products.length}</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent Products</CardTitle>
          <Button asChild variant="outline" size="sm">
            <Link href={`/dashboard/seller/stores/${store.url}/products`}>
              View in Seller Dashboard
              <ExternalLink className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {store.products.length === 0 ? (
            <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
              No products in this store yet.
            </div>
          ) : (
            <div className="space-y-2">
              {store.products.map((product) => (
                <div key={product.id} className="rounded-md border p-3">
                  <p className="font-medium">{product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Added: {product.createdAt.toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
