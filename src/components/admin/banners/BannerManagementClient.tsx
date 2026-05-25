"use client";

import type { AnnouncementBar, Banner } from "@prisma/client";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteBanner, reorderBanners, updateBanner } from "@/src/app/actions/banner.actions";
import { useRouter } from "next/navigation";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";

const AnnouncementBarForm = dynamic(
  () => import("@/src/components/admin/banners/AnnouncementBarForm"),
  {
    ssr: false,
    loading: () => <div className="h-28 w-full rounded-lg bg-muted/50 animate-pulse" />,
  }
);

const BannerDialog = dynamic(
  () => import("@/src/components/admin/banners/BannerDialog"),
  {
    ssr: false,
    loading: () => <div className="hidden" />,
  }
);

type BannerManagementClientProps = {
  banners: Banner[];
  announcementBar: AnnouncementBar | null;
};

export default function BannerManagementClient({ banners, announcementBar }: BannerManagementClientProps) {
  const router = useRouter();
  const [openCreate, setOpenCreate] = useState(false);
  const [createType, setCreateType] = useState<"HERO" | "ANNOUNCEMENT" | "PROMOTIONAL">("HERO");
  const [editingBanner, setEditingBanner] = useState<Banner | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  const orderedBanners = useMemo(() => [...banners].sort((a, b) => a.position - b.position), [banners]);
  const heroBanners = useMemo(() => orderedBanners.filter((banner) => banner.type === "HERO"), [orderedBanners]);
  const promotionalBanners = useMemo(
    () => orderedBanners.filter((banner) => banner.type === "PROMOTIONAL"),
    [orderedBanners]
  );

  const moveBanner = (bannerId: string, direction: "up" | "down") => {
    const ids = orderedBanners.map((item) => item.id);
    const currentIndex = ids.indexOf(bannerId);
    const nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (nextIndex < 0 || nextIndex >= ids.length) return;
    [ids[currentIndex], ids[nextIndex]] = [ids[nextIndex], ids[currentIndex]];

    startTransition(async () => {
      try {
        await reorderBanners(ids);
        toast.success("Banner order updated");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to reorder banners");
      }
    });
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="hero">
        <TabsList>
          <TabsTrigger value="hero">Hero Banners</TabsTrigger>
          <TabsTrigger value="promotional">Promotional Cards</TabsTrigger>
          <TabsTrigger value="announcement">Announcement Bar</TabsTrigger>
        </TabsList>

        <TabsContent value="hero" className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Banner Management</h1>
            <Button
              onClick={() => {
                setCreateType("HERO");
                setOpenCreate(true);
              }}
              className="gap-2"
            >
              <Plus size={16} />
              Add Banner
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Preview</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Clicks / Impressions</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {heroBanners.map((banner) => (
                <TableRow key={banner.id}>
                  <TableCell>
                    <Image
                      src={banner.image}
                      alt={banner.title?.trim() ? banner.title : "Banner"}
                      width={160}
                      height={90}
                      quality={100}
                      className="rounded-md border object-cover"
                    />
                  </TableCell>
                  <TableCell>
                    <p className="font-semibold">
                      {banner.title?.trim() ? banner.title : <span className="font-normal italic text-muted-foreground">No title</span>}
                    </p>
                    {banner.subtitle ? <p className="text-xs text-muted-foreground">{banner.subtitle}</p> : null}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{banner.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={banner.status === "ACTIVE" ? "default" : banner.status === "SCHEDULED" ? "secondary" : "outline"}>
                      {banner.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">
                    {banner.startDate ? new Date(banner.startDate).toLocaleString() : "Any"} -{" "}
                    {banner.endDate ? new Date(banner.endDate).toLocaleString() : "Any"}
                  </TableCell>
                  <TableCell>{banner.clicks} / {banner.impressions}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button size="icon" variant="outline" onClick={() => moveBanner(banner.id, "up")} disabled={isPending}>
                        <ArrowUp size={14} />
                      </Button>
                      <Button size="icon" variant="outline" onClick={() => moveBanner(banner.id, "down")} disabled={isPending}>
                        <ArrowDown size={14} />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={banner.status === "ACTIVE"}
                        onCheckedChange={(checked) =>
                          startTransition(async () => {
                            try {
                              await updateBanner(banner.id, { status: checked ? "ACTIVE" : "INACTIVE" });
                              toast.success("Banner status updated");
                              router.refresh();
                            } catch (error) {
                              toast.error(error instanceof Error ? error.message : "Failed to update status");
                            }
                          })
                        }
                      />
                      <Button variant="outline" size="icon" onClick={() => setEditingBanner(banner)}>
                        <Pencil size={14} />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() =>
                          startTransition(async () => {
                            try {
                              await deleteBanner(banner.id);
                              toast.success("Banner deleted");
                              router.refresh();
                            } catch (error) {
                              toast.error(error instanceof Error ? error.message : "Failed to delete");
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
        </TabsContent>

        <TabsContent value="promotional" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Promotional 6 Cards</h2>
              <p className="text-sm text-muted-foreground">Upload up to 6 active cards with image and link for homepage.</p>
            </div>
            <Button
              onClick={() => {
                setCreateType("PROMOTIONAL");
                setOpenCreate(true);
              }}
              className="gap-2"
            >
              <Plus size={16} />
              Add Card
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Preview</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Clicks / Impressions</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promotionalBanners.map((banner) => (
                <TableRow key={banner.id}>
                  <TableCell>
                    <Image
                      src={banner.image}
                      alt={banner.title?.trim() ? banner.title : "Banner"}
                      width={160}
                      height={90}
                      quality={100}
                      className="rounded-md border object-cover"
                    />
                  </TableCell>
                  <TableCell>
                    <p className="font-semibold">
                      {banner.title?.trim() ? banner.title : <span className="font-normal italic text-muted-foreground">No title</span>}
                    </p>
                    {banner.subtitle ? <p className="text-xs text-muted-foreground">{banner.subtitle}</p> : null}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{banner.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={banner.status === "ACTIVE" ? "default" : banner.status === "SCHEDULED" ? "secondary" : "outline"}>
                      {banner.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">
                    {banner.startDate ? new Date(banner.startDate).toLocaleString() : "Any"} -{" "}
                    {banner.endDate ? new Date(banner.endDate).toLocaleString() : "Any"}
                  </TableCell>
                  <TableCell>{banner.clicks} / {banner.impressions}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button size="icon" variant="outline" onClick={() => moveBanner(banner.id, "up")} disabled={isPending}>
                        <ArrowUp size={14} />
                      </Button>
                      <Button size="icon" variant="outline" onClick={() => moveBanner(banner.id, "down")} disabled={isPending}>
                        <ArrowDown size={14} />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={banner.status === "ACTIVE"}
                        onCheckedChange={(checked) =>
                          startTransition(async () => {
                            try {
                              await updateBanner(banner.id, { status: checked ? "ACTIVE" : "INACTIVE" });
                              toast.success("Banner status updated");
                              router.refresh();
                            } catch (error) {
                              toast.error(error instanceof Error ? error.message : "Failed to update status");
                            }
                          })
                        }
                      />
                      <Button variant="outline" size="icon" onClick={() => setEditingBanner(banner)}>
                        <Pencil size={14} />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() =>
                          startTransition(async () => {
                            try {
                              await deleteBanner(banner.id);
                              toast.success("Banner deleted");
                              router.refresh();
                            } catch (error) {
                              toast.error(error instanceof Error ? error.message : "Failed to delete");
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
        </TabsContent>

        <TabsContent value="announcement">
          <AnnouncementBarForm announcementBar={announcementBar} />
        </TabsContent>
      </Tabs>

      {openCreate ? (
        <BannerDialog open={openCreate} onOpenChange={setOpenCreate} defaultType={createType} />
      ) : null}
      {editingBanner ? (
        <BannerDialog
          open={Boolean(editingBanner)}
          onOpenChange={(open) => !open && setEditingBanner(undefined)}
          initialBanner={editingBanner}
        />
      ) : null}
    </div>
  );
}
