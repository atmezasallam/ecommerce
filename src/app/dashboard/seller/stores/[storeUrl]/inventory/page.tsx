import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AlertTriangle, Boxes, Package, Warehouse } from "lucide-react";

import { db } from "@/src/lib/db";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";

type InventoryRow = {
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
  sku: string;
  sizeId: string;
  size: string;
  price: number;
  discount: number;
  finalPrice: number;
  quantity: number;
};

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

function stockBadge(quantity: number) {
  if (quantity <= 0) return { label: "Out of stock", className: "bg-red-500/10 text-red-700 border-red-500/20" };
  if (quantity < 5) return { label: "Low stock", className: "bg-orange-500/10 text-orange-700 border-orange-500/20" };
  return { label: "In stock", className: "bg-green-500/10 text-green-700 border-green-500/20" };
}

export default async function SellerStoreInventoryPage({
  params,
}: {
  params: { storeUrl: string };
}) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const store = await db.store.findFirst({
    where: { url: params.storeUrl, userId },
    select: { id: true, name: true },
  });
  if (!store) {
    redirect("/dashboard/seller/stores");
  }

  const products = await db.product.findMany({
    where: { storeId: store.id },
    select: {
      id: true,
      name: true,
      variants: {
        select: {
          id: true,
          variantName: true,
          sku: true,
          sizes: {
            select: {
              id: true,
              size: true,
              quantity: true,
              price: true,
              discount: true,
            },
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const rows: InventoryRow[] = products.flatMap((product) =>
    product.variants.flatMap((variant) =>
      variant.sizes.map((size) => {
        const finalPrice = size.price - (size.price * size.discount) / 100;
        return {
          productId: product.id,
          productName: product.name,
          variantId: variant.id,
          variantName: variant.variantName,
          sku: variant.sku,
          sizeId: size.id,
          size: size.size,
          price: size.price,
          discount: size.discount,
          finalPrice,
          quantity: size.quantity,
        };
      })
    )
  );

  const totalSkus = rows.length;
  const totalUnits = rows.reduce((acc, row) => acc + row.quantity, 0);
  const lowStockCount = rows.filter((row) => row.quantity > 0 && row.quantity < 5).length;
  const outOfStockCount = rows.filter((row) => row.quantity <= 0).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Inventory</h1>
        <p className="text-muted-foreground">
          Stock overview for <span className="font-medium text-foreground">{store.name}</span>.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Tracked SKUs</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-2xl font-bold">{totalSkus}</p>
            <Boxes className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Units</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-2xl font-bold">{totalUnits}</p>
            <Warehouse className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Low Stock</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-2xl font-bold">{lowStockCount}</p>
            <AlertTriangle className="h-5 w-5 text-orange-500" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Out of Stock</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-2xl font-bold">{outOfStockCount}</p>
            <Package className="h-5 w-5 text-red-500" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Stock by Variant Size</CardTitle>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
              No inventory yet. Add products and sizes to start tracking stock.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Variant</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Discount</TableHead>
                  <TableHead className="text-right">Final</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => {
                  const badge = stockBadge(row.quantity);
                  return (
                    <TableRow key={row.sizeId}>
                      <TableCell className="font-medium">{row.productName}</TableCell>
                      <TableCell>{row.variantName}</TableCell>
                      <TableCell className="font-mono text-xs">{row.sku}</TableCell>
                      <TableCell>{row.size}</TableCell>
                      <TableCell className="text-right">{money.format(row.price)}</TableCell>
                      <TableCell className="text-right">{row.discount}%</TableCell>
                      <TableCell className="text-right font-medium">{money.format(row.finalPrice)}</TableCell>
                      <TableCell className="text-right">{row.quantity}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={badge.className}>
                          {badge.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
