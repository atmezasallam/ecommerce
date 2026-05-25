import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AlertTriangle, ExternalLink, Store as StoreIcon } from "lucide-react";

import {
  adminSetStoreFeatured,
  adminUpdateStoreBasics,
  updateStoreStatus,
} from "@/src/app/actions/admin-store.actions";
import { Alert, AlertDescription, AlertTitle } from "@/src/components/ui/alert";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { db } from "@/src/lib/db";
import { isPlatformAdmin } from "@/src/lib/admin-access";

type StoreStatus = "PENDING" | "ACTIVE" | "BANNED" | "DISABLED";

type StoreRow = {
  id: string;
  name: string;
  url: string;
  email: string;
  phone: string;
  status: StoreStatus;
  featured: boolean;
  createdAt: Date | string;
  ownerName: string;
  ownerEmail: string;
  productCount: number;
  followerCount: number;
};

const statusClass: Record<StoreStatus, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
  ACTIVE: "bg-green-500/10 text-green-700 border-green-500/20",
  BANNED: "bg-red-500/10 text-red-700 border-red-500/20",
  DISABLED: "bg-base/10 text-subtle border-border/20",
};

const PAGE_SIZE = 50;
const STATUS_FILTERS: StoreStatus[] = ["PENDING", "ACTIVE", "BANNED", "DISABLED"];

const formatDate = (value: Date | string) => {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString();
};

function buildListSearchParams(opts: {
  q?: string;
  status?: string;
  featured?: string;
  page?: number;
}) {
  const p = new URLSearchParams();
  const q = opts.q?.trim();
  if (q) p.set("q", q);
  if (opts.status && STATUS_FILTERS.includes(opts.status as StoreStatus)) {
    p.set("status", opts.status);
  }
  if (opts.featured === "true" || opts.featured === "false") {
    p.set("featured", opts.featured);
  }
  if (opts.page && opts.page > 1) p.set("page", String(opts.page));
  return p.toString();
}

function storesHref(query: string) {
  return query ? `/dashboard/admin/stores?${query}` : "/dashboard/admin/stores";
}

export default async function AdminStoresPage({
  searchParams,
}: {
  searchParams?: { page?: string; q?: string; status?: string; featured?: string; err?: string };
}) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }

  const [dbUser, clerkUser] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { role: true },
    }),
    currentUser(),
  ]);

  if (!isPlatformAdmin(dbUser?.role, clerkUser?.privateMetadata?.role)) {
    redirect("/");
  }

  const q = searchParams?.q?.trim() ?? "";
  const statusFilter =
    searchParams?.status && STATUS_FILTERS.includes(searchParams.status as StoreStatus)
      ? (searchParams.status as StoreStatus)
      : undefined;
  const featuredFilter =
    searchParams?.featured === "true" || searchParams?.featured === "false"
      ? searchParams.featured
      : undefined;

  const currentPage = Math.max(1, Number(searchParams?.page ?? "1") || 1);
  const skip = (currentPage - 1) * PAGE_SIZE;

  const where: Prisma.StoreWhereInput = {};
  if (q.length > 0) {
    where.OR = [
      { name: { contains: q } },
      { url: { contains: q } },
      { email: { contains: q } },
      { phone: { contains: q } },
      { user: { name: { contains: q } } },
      { user: { email: { contains: q } } },
    ];
  }
  if (statusFilter) {
    where.status = statusFilter;
  }
  if (featuredFilter === "true") {
    where.featured = true;
  } else if (featuredFilter === "false") {
    where.featured = false;
  }

  const returnSearchString = buildListSearchParams({
    q,
    status: statusFilter,
    featured: featuredFilter,
    page: currentPage,
  });

  const [stores, filteredTotal, total, active, pending, featured] = await Promise.all([
    db.store.findMany({
      where,
      select: {
        id: true,
        name: true,
        url: true,
        email: true,
        phone: true,
        status: true,
        featured: true,
        createdAt: true,
        user: {
          select: { name: true, email: true },
        },
        _count: {
          select: {
            products: true,
            followers: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
    }),
    db.store.count({ where }),
    db.store.count(),
    db.store.count({ where: { status: "ACTIVE" } }),
    db.store.count({ where: { status: "PENDING" } }),
    db.store.count({ where: { featured: true } }),
  ]);

  const rows = stores as Array<{
    id: string;
    name: string;
    url: string;
    email: string;
    phone: string;
    status: StoreStatus;
    featured: boolean;
    createdAt: Date | string;
    user: { name: string; email: string };
    _count: { products: number; followers: number };
  }>;

  const mappedRows: StoreRow[] = rows.map((store) => ({
    id: store.id,
    name: store.name,
    url: store.url,
    email: store.email,
    phone: store.phone,
    status: store.status,
    featured: store.featured,
    createdAt: store.createdAt,
    ownerName: store.user.name,
    ownerEmail: store.user.email,
    productCount: store._count.products,
    followerCount: store._count.followers,
  }));

  const totalPages = Math.max(1, Math.ceil(filteredTotal / PAGE_SIZE));
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  const prevHref = storesHref(
    buildListSearchParams({
      q,
      status: statusFilter,
      featured: featuredFilter,
      page: currentPage - 1,
    }),
  );
  const nextHref = storesHref(
    buildListSearchParams({
      q,
      status: statusFilter,
      featured: featuredFilter,
      page: currentPage + 1,
    }),
  );

  const errMsg = searchParams?.err
    ? (() => {
        try {
          return decodeURIComponent(searchParams.err);
        } catch {
          return searchParams.err;
        }
      })()
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Stores</h1>
        <p className="text-muted-foreground">Manage seller stores across Salamo.</p>
      </div>

      {errMsg ? (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Could not save</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <span>{errMsg}</span>
            <Link href={storesHref(returnSearchString)} className="w-fit text-sm font-medium underline">
              Dismiss
            </Link>
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Stores</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-2xl font-bold">{total}</p>
            <StoreIcon className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{active}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Pending Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Featured</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{featured}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base">All Stores</CardTitle>
            <p className="text-sm text-muted-foreground">
              {filteredTotal} match{filteredTotal === 1 ? "" : "es"}
              {q || statusFilter || featuredFilter ? " (filters applied)" : ""}
            </p>
          </div>
          <form method="get" action="/dashboard/admin/stores" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="admin-stores-q">Search</Label>
              <Input
                id="admin-stores-q"
                name="q"
                placeholder="Name, URL, email, phone, owner…"
                defaultValue={q}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="admin-stores-status">Status</Label>
              <select
                id="admin-stores-status"
                name="status"
                defaultValue={statusFilter ?? ""}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Any status</option>
                {STATUS_FILTERS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="admin-stores-featured">Featured</Label>
              <select
                id="admin-stores-featured"
                name="featured"
                defaultValue={featuredFilter ?? ""}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Any</option>
                <option value="true">Featured only</option>
                <option value="false">Not featured</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <Button type="submit" className="flex-1">
                Apply filters
              </Button>
              <Button asChild type="button" variant="outline" className="flex-1">
                <Link href="/dashboard/admin/stores">Clear</Link>
              </Button>
            </div>
          </form>
        </CardHeader>
        <CardContent>
          {mappedRows.length === 0 ? (
            <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
              No stores found.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[220px]">Store &amp; contact</TableHead>
                      <TableHead className="min-w-[140px]">Owner</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Featured</TableHead>
                      <TableHead className="text-right">Products</TableHead>
                      <TableHead className="text-right">Followers</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="min-w-[200px]">Status update</TableHead>
                      <TableHead className="min-w-[200px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mappedRows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>
                          <form action={adminUpdateStoreBasics} className="flex flex-col gap-2">
                            <input type="hidden" name="storeId" value={row.id} />
                            <input type="hidden" name="returnSearch" value={returnSearchString} />
                            <Input name="name" defaultValue={row.name} aria-label="Store name" />
                            <Input
                              name="url"
                              defaultValue={row.url}
                              className="font-mono text-xs"
                              aria-label="Store URL slug"
                            />
                            <Input
                              name="email"
                              type="email"
                              defaultValue={row.email}
                              aria-label="Store email"
                            />
                            <Input name="phone" defaultValue={row.phone} aria-label="Store phone" />
                            <Button type="submit" size="sm" variant="secondary">
                              Save profile
                            </Button>
                          </form>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{row.ownerName}</span>
                            <span className="text-xs text-muted-foreground">{row.ownerEmail}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className={statusClass[row.status]}>
                              {row.status}
                            </Badge>
                            {row.featured ? <Badge variant="secondary">Featured</Badge> : null}
                          </div>
                        </TableCell>
                        <TableCell>
                          <form action={adminSetStoreFeatured} className="flex flex-col gap-2">
                            <input type="hidden" name="storeId" value={row.id} />
                            <input type="hidden" name="returnSearch" value={returnSearchString} />
                            <input type="hidden" name="featured" value={row.featured ? "false" : "true"} />
                            <Button type="submit" size="sm" variant={row.featured ? "outline" : "default"}>
                              {row.featured ? "Remove featured" : "Set featured"}
                            </Button>
                          </form>
                        </TableCell>
                        <TableCell className="text-right">{row.productCount}</TableCell>
                        <TableCell className="text-right">{row.followerCount}</TableCell>
                        <TableCell>{formatDate(row.createdAt)}</TableCell>
                        <TableCell>
                          <form action={updateStoreStatus} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <input type="hidden" name="storeId" value={row.id} />
                            <select
                              name="status"
                              defaultValue={row.status}
                              className="h-9 w-full rounded-md border bg-background px-2 text-sm sm:min-w-[140px]"
                            >
                              <option value="PENDING">PENDING</option>
                              <option value="ACTIVE">ACTIVE</option>
                              <option value="BANNED">BANNED</option>
                              <option value="DISABLED">DISABLED</option>
                            </select>
                            <Button type="submit" size="sm" variant="secondary">
                              Save status
                            </Button>
                          </form>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col items-end gap-2 sm:flex-row sm:justify-end">
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/dashboard/admin/stores/${row.id}`}>
                                Admin Details
                                <ExternalLink className="ml-1 h-3.5 w-3.5" />
                              </Link>
                            </Button>
                            <Button asChild size="sm">
                              <Link href={`/dashboard/seller/stores/${row.url}/products`}>
                                Seller Dashboard
                                <ExternalLink className="ml-1 h-3.5 w-3.5" />
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <Button asChild size="sm" variant="outline" disabled={!hasPrev}>
                    <Link href={hasPrev ? prevHref : "#"}>
                      Previous
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" disabled={!hasNext}>
                    <Link href={hasNext ? nextHref : "#"}>
                      Next
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
