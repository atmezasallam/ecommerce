"use client";

import { useMemo, useState, useTransition } from "react";
import { Heart, Share2, ShoppingCart, Sparkles, Tag, Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { WishlistItemFull } from "@/types/wishlist.types";
import { clearWishlist } from "@/src/app/actions/wishlist.actions";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { ButtonGroup } from "@/src/components/ui/button-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";
import WishlistEmptyState from "@/src/components/wishlist/WishlistEmptyState";
import WishlistGrid from "@/src/components/wishlist/WishlistGrid";
import WishlistMoveAllDialog from "@/src/components/wishlist/WishlistMoveAllDialog";
import WishlistShareDialog from "@/src/components/wishlist/WishlistShareDialog";
import {
  formatWishlistUsd,
  isSaleActive,
  pickLowestEffectivePriceSize,
} from "@/src/lib/wishlist-pricing";
import { cn } from "@/src/lib/utils";

type FilterTab = "all" | "sale" | "stock" | "store";
type SortKey = "recent" | "priceAsc" | "priceDesc" | "popular";

type WishlistViewProps = {
  initialItems: WishlistItemFull[];
  shareUserId: string | null;
  siteUrl: string;
  stats: {
    totalItems: number;
    totalValue: number;
    totalSavings: number;
  };
};

function minEffective(item: WishlistItemFull): number {
  const p = pickLowestEffectivePriceSize(item.variant.sizes);
  return p?.effective ?? Number.POSITIVE_INFINITY;
}

function anyInStock(item: WishlistItemFull): boolean {
  return item.variant.sizes.some((s) => s.quantity > 0);
}

export default function WishlistView({
  initialItems,
  shareUserId,
  siteUrl,
  stats,
}: WishlistViewProps) {
  const [items, setItems] = useState(initialItems);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [sort, setSort] = useState<SortKey>("recent");
  const [shareOpen, setShareOpen] = useState(false);
  const [moveAllOpen, setMoveAllOpen] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const [clearing, startClear] = useTransition();

  const shareUrl =
    shareUserId !== null ? `${siteUrl}/wishlist/share/${shareUserId}` : siteUrl;

  const filteredSorted = useMemo(() => {
    let list = [...items];
    if (filter === "sale") {
      list = list.filter(
        (i) => i.variant.isSale && isSaleActive(i.variant.isSale, i.variant.saleEndDate)
      );
    } else if (filter === "stock") {
      list = list.filter((i) => anyInStock(i));
    }

    list.sort((a, b) => {
      if (sort === "recent") {
        return b.createdAt.getTime() - a.createdAt.getTime();
      }
      if (sort === "priceAsc") {
        return minEffective(a) - minEffective(b);
      }
      if (sort === "priceDesc") {
        return minEffective(b) - minEffective(a);
      }
      return b.product.sales - a.product.sales;
    });

    return list;
  }, [items, filter, sort]);

  const groupedByStore = useMemo(() => {
    const map = new Map<string, WishlistItemFull[]>();
    for (const it of filteredSorted) {
      const k = it.product.storeId;
      const cur = map.get(k) ?? [];
      cur.push(it);
      map.set(k, cur);
    }
    return map;
  }, [filteredSorted]);

  const onRemoved = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const onMoveAllDone = () => {
    setItems([]);
  };

  const confirmClear = () => {
    startClear(async () => {
      const res = await clearWishlist();
      if (res.success) {
        setItems([]);
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
      setClearOpen(false);
    });
  };

  const statCard = (
    icon: React.ReactNode,
    label: string,
    value: string,
    className?: string
  ) => (
    <div
      className={cn(
        "rounded-2xl border bg-gradient-to-br from-muted/60 to-muted/20 p-4 shadow-sm",
        className
      )}
    >
      <div className="flex items-center gap-2 text-muted-foreground">{icon}</div>
      <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{value}</p>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
    </div>
  );

  if (items.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Wishlist</h1>
          <p className="text-sm text-muted-foreground">Items you save for later</p>
        </div>
        <WishlistEmptyState />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        {statCard(
          <Heart className="h-5 w-5" />,
          "Saved Items",
          `${stats.totalItems}`,
          "from-primary/5 to-transparent"
        )}
        {statCard(
          <Tag className="h-5 w-5" />,
          "Worth",
          formatWishlistUsd(stats.totalValue)
        )}
        {statCard(
          <Sparkles className="h-5 w-5" />,
          "Save on sale items",
          formatWishlistUsd(stats.totalSavings)
        )}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">My Wishlist</h1>
          <Badge variant="secondary" className="text-sm">
            {items.length}
          </Badge>
        </div>
        <ButtonGroup className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setShareOpen(true)}
            disabled={!shareUserId}
          >
            <Share2 className="h-4 w-4" />
            Share Wishlist
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setMoveAllOpen(true)}
          >
            <ShoppingCart className="h-4 w-4" />
            Move All to Cart
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setClearOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            Clear All
          </Button>
        </ButtonGroup>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <Tabs
          value={filter}
          onValueChange={(v) => setFilter(v as FilterTab)}
          className="w-full lg:w-auto"
        >
          <TabsList className="h-auto flex-wrap">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="sale">On Sale</TabsTrigger>
            <TabsTrigger value="stock">In Stock</TabsTrigger>
            <TabsTrigger value="store">By Store</TabsTrigger>
          </TabsList>
        </Tabs>
        <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
          <SelectTrigger className="w-full sm:w-[220px]">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Recently Added</SelectItem>
            <SelectItem value="priceAsc">Price: Low to High</SelectItem>
            <SelectItem value="priceDesc">Price: High to Low</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filter === "store" ? (
        <div className="space-y-10">
          {[...groupedByStore.entries()].map(([storeId, group]) => {
            const storeName = group[0]?.product.store.name ?? "Store";
            return (
              <section key={storeId}>
                <h2 className="mb-4 text-lg font-semibold text-foreground">{storeName}</h2>
                <WishlistGrid items={group} onRemoved={onRemoved} />
              </section>
            );
          })}
        </div>
      ) : filteredSorted.length === 0 ? (
        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          No items match this filter.
        </p>
      ) : (
        <WishlistGrid items={filteredSorted} onRemoved={onRemoved} />
      )}

      <WishlistShareDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        shareUrl={shareUrl}
        title="My Salamo wishlist"
      />
      <WishlistMoveAllDialog
        open={moveAllOpen}
        onOpenChange={setMoveAllOpen}
        itemCount={items.length}
        onDone={onMoveAllDone}
      />
      <AlertDialog open={clearOpen} onOpenChange={setClearOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear wishlist?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes every saved item. You can add products again anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={clearing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmClear();
              }}
              disabled={clearing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {clearing ? "Clearing…" : "Clear all"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
