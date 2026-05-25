"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { Loader2, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { startConversation } from "@/src/app/actions/message.actions";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Switch } from "@/src/components/ui/switch";
import { Textarea } from "@/src/components/ui/textarea";
import { cn } from "@/src/lib/utils";

type StoreRow = { id: string; name: string; logo: string; url: string };
type ProductRow = { id: string; name: string; slug: string };

type NewMessageDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function NewMessageDialog({ open, onOpenChange }: NewMessageDialogProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [storeQuery, setStoreQuery] = useState("");
  const [stores, setStores] = useState<StoreRow[]>([]);
  const [storeLoading, setStoreLoading] = useState(false);
  const [selectedStore, setSelectedStore] = useState<StoreRow | null>(null);
  const [productToggle, setProductToggle] = useState(false);
  const [productQuery, setProductQuery] = useState("");
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [productLoading, setProductLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductRow | null>(null);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  const reset = () => {
    setStep(1);
    setStoreQuery("");
    setStores([]);
    setSelectedStore(null);
    setProductToggle(false);
    setProductQuery("");
    setProducts([]);
    setSelectedProduct(null);
    setMessage("");
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  useEffect(() => {
    if (!open || step !== 1) return;
    const t = window.setTimeout(() => {
      if (storeQuery.trim().length < 1) {
        setStores([]);
        return;
      }
      setStoreLoading(true);
      void fetch(`/api/stores/search?q=${encodeURIComponent(storeQuery.trim())}`)
        .then((r) => r.json() as Promise<StoreRow[]>)
        .then(setStores)
        .catch(() => setStores([]))
        .finally(() => setStoreLoading(false));
    }, 300);
    return () => window.clearTimeout(t);
  }, [storeQuery, open, step]);

  const loadProducts = useCallback(async (storeId: string, q: string) => {
    setProductLoading(true);
    try {
      const url = `/api/stores/${storeId}/products/search?q=${encodeURIComponent(q)}`;
      const rows = (await fetch(url).then((r) => r.json())) as ProductRow[];
      setProducts(rows);
    } catch {
      setProducts([]);
    } finally {
      setProductLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open || step !== 2 || !selectedStore || !productToggle) return;
    const t = window.setTimeout(() => {
      void loadProducts(selectedStore.id, productQuery.trim());
    }, 300);
    return () => window.clearTimeout(t);
  }, [open, step, selectedStore, productToggle, productQuery, loadProducts]);

  const pickStore = (s: StoreRow) => {
    setSelectedStore(s);
    setStep(2);
    setProductToggle(false);
    setSelectedProduct(null);
    setProducts([]);
  };

  const send = () => {
    if (!selectedStore) return;
    const trimmed = message.trim();
    if (trimmed.length < 10) {
      toast.error("Message must be at least 10 characters.");
      return;
    }
    const pid = productToggle && selectedProduct ? selectedProduct.id : undefined;
    startTransition(async () => {
      const res = await startConversation(selectedStore.id, trimmed, pid);
      if (res.success && res.conversationId) {
        toast.success("Message sent!");
        handleOpenChange(false);
        router.push(`/profile/messages?conversationId=${res.conversationId}`);
      } else {
        toast.error(res.message ?? "Failed to send.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New message</DialogTitle>
          <DialogDescription>Contact a seller on Salamo</DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-3">
            <Label htmlFor="store-search">Find a store</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="store-search"
                className="pl-9"
                placeholder="Search by store name..."
                value={storeQuery}
                onChange={(e) => setStoreQuery(e.target.value)}
              />
            </div>
            {storeLoading && (
              <div className="flex justify-center py-2">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}
            <ul className="max-h-56 space-y-1 overflow-y-auto rounded-md border p-1">
              {stores.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-accent"
                    onClick={() => pickStore(s)}
                  >
                    <Image src={s.logo} alt="" width={36} height={36} className="h-9 w-9 rounded-full object-cover" />
                    <span className="font-medium">{s.name}</span>
                  </button>
                </li>
              ))}
              {!storeLoading && storeQuery.trim().length > 0 && stores.length === 0 && (
                <li className="px-2 py-4 text-center text-sm text-muted-foreground">No stores found</li>
              )}
            </ul>
          </div>
        )}

        {step === 2 && selectedStore && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <Image
                src={selectedStore.logo}
                alt=""
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover"
              />
              <span className="font-semibold">{selectedStore.name}</span>
              <Button type="button" variant="ghost" size="sm" className="ml-auto" onClick={() => setStep(1)}>
                Change
              </Button>
            </div>
            <div className="flex items-center justify-between gap-2 rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">About a specific product?</p>
                <p className="text-xs text-muted-foreground">Optional — link this chat to a product</p>
              </div>
              <Switch checked={productToggle} onCheckedChange={setProductToggle} />
            </div>
            {productToggle && (
              <div className="space-y-2">
                <Input
                  placeholder="Search products in this store..."
                  value={productQuery}
                  onChange={(e) => setProductQuery(e.target.value)}
                />
                {productLoading && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
                <ul className="max-h-40 space-y-1 overflow-y-auto rounded-md border p-1">
                  {products.map((p) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        className={cn(
                          "w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent",
                          selectedProduct?.id === p.id && "bg-primary/10"
                        )}
                        onClick={() => setSelectedProduct(p)}
                      >
                        {p.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <Button type="button" className="w-full" onClick={() => setStep(3)}>
              Continue
            </Button>
          </div>
        )}

        {step === 3 && selectedStore && (
          <div className="space-y-3">
            <Label>Your message</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 1000))}
              placeholder="What would you like to ask?"
              rows={5}
              className="resize-none"
            />
            <p className="text-right text-xs text-muted-foreground">{message.length}/1000</p>
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button type="button" className="flex-1" disabled={pending} onClick={send}>
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
