"use client";

import type { HomepageBrand } from "@prisma/client";
import Image from "next/image";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteHomepageBrand, reorderHomepageBrands, updateHomepageBrand } from "@/src/app/actions/homepage-brand.actions";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Switch } from "@/src/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import HomepageBrandDialog from "./HomepageBrandDialog";

type Props = {
  brands: HomepageBrand[];
};

export default function HomepageBrandsManagementClient({ brands }: Props) {
  const router = useRouter();
  const [openCreate, setOpenCreate] = useState(false);
  const [editing, setEditing] = useState<HomepageBrand | undefined>();
  const [isPending, startTransition] = useTransition();

  const ordered = useMemo(() => [...brands].sort((a, b) => a.position - b.position), [brands]);

  const move = (id: string, direction: "up" | "down") => {
    const ids = ordered.map((b) => b.id);
    const i = ids.indexOf(id);
    const j = direction === "up" ? i - 1 : i + 1;
    if (j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    startTransition(async () => {
      try {
        await reorderHomepageBrands(ids);
        toast.success("Order updated");
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to reorder");
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Brands just for you</h1>
        <Button
          className="gap-2"
          onClick={() => {
            setEditing(undefined);
            setOpenCreate(true);
          }}
        >
          <Plus size={16} />
          Add brand
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">Active brands appear in a horizontal row on the store homepage.</p>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Logo</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Link</TableHead>
            <TableHead>Visible</TableHead>
            <TableHead>Order</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ordered.map((brand) => (
            <TableRow key={brand.id}>
              <TableCell>
                <div className="relative h-12 w-20 rounded-md border bg-surface">
                  <Image src={brand.logo} alt="" fill className="object-contain p-1" sizes="80px" unoptimized />
                </div>
              </TableCell>
              <TableCell className="font-medium">{brand.name}</TableCell>
              <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">{brand.href}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={brand.isActive}
                    onCheckedChange={(checked) =>
                      startTransition(async () => {
                        try {
                          await updateHomepageBrand(brand.id, { isActive: checked });
                          toast.success(checked ? "Brand shown on homepage" : "Brand hidden");
                          router.refresh();
                        } catch (e) {
                          toast.error(e instanceof Error ? e.message : "Update failed");
                        }
                      })
                    }
                  />
                  <Badge variant={brand.isActive ? "default" : "outline"}>{brand.isActive ? "On" : "Off"}</Badge>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button size="icon" variant="outline" disabled={isPending} onClick={() => move(brand.id, "up")}>
                    <ArrowUp size={14} />
                  </Button>
                  <Button size="icon" variant="outline" disabled={isPending} onClick={() => move(brand.id, "down")}>
                    <ArrowDown size={14} />
                  </Button>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => {
                      setOpenCreate(false);
                      setEditing(brand);
                    }}
                  >
                    <Pencil size={14} />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="text-destructive"
                    onClick={() =>
                      startTransition(async () => {
                        try {
                          await deleteHomepageBrand(brand.id);
                          toast.success("Brand removed");
                          router.refresh();
                        } catch (e) {
                          toast.error(e instanceof Error ? e.message : "Delete failed");
                        }
                      })
                    }
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {ordered.length === 0 ? (
        <p className="text-sm text-muted-foreground">No brands yet. Add one to show the section on the homepage.</p>
      ) : null}

      <HomepageBrandDialog
        key={editing?.id ?? (openCreate ? "create" : "closed")}
        open={openCreate || !!editing}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setOpenCreate(false);
            setEditing(undefined);
          }
        }}
        initial={editing}
      />
    </div>
  );
}
