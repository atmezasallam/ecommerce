"use client";

import type { Category, OfferTag } from "@prisma/client";
import { SignOutButton } from "@clerk/nextjs";
import {
  Heart,
  LogOut,
  Menu,
  MessageSquare,
  Smartphone,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import CartBadge from "@/src/components/cart/CartBadge";
import MessageBadge from "@/src/components/messages/MessageBadge";
import WishlistBadge from "@/src/components/wishlist/WishlistBadge";
import { CartIcon } from "@/src/components/store/icons";
import CountrySelector from "@/src/components/shared/country-selector";
import { getOfferTagBrowseHref } from "@/src/lib/browse-links";
import { Button } from "@/src/components/store/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/src/components/ui/sheet";
import { Separator } from "@/src/components/ui/separator";
import type { Country } from "@/src/lib/types";
import countries from "@/src/data/countries.json";
import { useRouter } from "next/navigation";
import "/node_modules/flag-icons/css/flag-icons.min.css";

import PlayStoreImg from "@/public/assets/icons/google-play.webp";
import AppStoreImg from "@/public/assets/icons/app-store.webp";

type MobileHeaderMenuProps = {
  categories: Category[];
  offerTags: OfferTag[];
  userCountry: Country;
  cartCount: number;
  wishlistCount: number;
  messageUnreadCount: number;
  isSignedIn: boolean;
  userName?: string;
  userAvatar?: string;
};

const accountLinks = [
  { title: "Profile", href: "/profile" },
  { title: "Settings", href: "/settings" },
  { title: "Become a Seller", href: "/become-a-seller" },
  { title: "Help Center", href: "/help-center" },
  { title: "Return & Refund Policy", href: "/refund-policy" },
];

export default function MobileHeaderMenu({
  categories,
  offerTags,
  userCountry,
  cartCount,
  wishlistCount,
  messageUnreadCount,
  isSignedIn,
  userName,
  userAvatar,
}: MobileHeaderMenuProps) {
  const [open, setOpen] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const router = useRouter();

  const close = () => setOpen(false);

  const handleCountryClick = async (country: string) => {
    const countryData = countries.find((c) => c.name === country);
    if (!countryData) return;

    const data: Country = {
      name: countryData.name,
      code: countryData.code,
      city: "",
      region: "",
    };

    try {
      const response = await fetch("/api/setUserCountryInCookies", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ userCountry: data }),
      });
      if (response.ok) {
        router.refresh();
        setCountryOpen(false);
      }
    } catch (error) {
      console.error("Error in handleCountryClick:", error);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Open menu"
          className="grid h-10 w-10 place-items-center rounded-full border border-white/30 bg-white/10 text-white transition-colors hover:bg-white/20 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
      </SheetTrigger>

      <SheetContent
        side="left"
        overlayClassName="z-[100]"
        className="z-[100] w-[min(100vw-2rem,320px)] overflow-y-auto p-0 sm:max-w-sm"
      >
        <SheetHeader className="border-b px-4 py-4 pr-12 text-left">
          <SheetTitle className="text-lg font-bold text-main-primary">Menu</SheetTitle>
        </SheetHeader>

        <div className="px-4 py-4">
          {isSignedIn ? (
            <div className="flex items-center gap-3">
              {userAvatar ? (
                <Image
                  src={userAvatar}
                  alt={userName ?? "Account"}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="grid h-10 w-10 place-items-center rounded-full bg-muted">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-main-primary">{userName ?? "Account"}</p>
                <Link
                  href="/profile"
                  onClick={close}
                  className="text-xs text-[#2d6b54] hover:underline"
                >
                  View profile
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link href="/sign-in" onClick={close}>
                <Button className="w-full">Sign in</Button>
              </Link>
              <Link
                href="/sign-up"
                onClick={close}
                className="flex h-10 items-center justify-center rounded-md border border-border text-sm font-medium text-main-primary hover:bg-muted"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 border-y px-4 py-3">
          <Link
            href="/cart"
            onClick={close}
            className="flex flex-col items-center gap-1 rounded-xl p-2 text-center hover:bg-muted"
          >
            <span className="relative text-[28px] leading-none text-subtle">
              <CartIcon />
              <span className="absolute -right-2 -top-2">
                <CartBadge count={cartCount} />
              </span>
            </span>
            <span className="text-xs font-medium text-main-primary">Cart</span>
          </Link>
          <Link
            href="/profile/wishlist"
            onClick={close}
            className="flex flex-col items-center gap-1 rounded-xl p-2 text-center hover:bg-muted"
          >
            <span className="relative">
              <Heart className="h-5 w-5 text-subtle" />
              <span className="absolute -right-2 -top-2">
                <WishlistBadge count={wishlistCount} />
              </span>
            </span>
            <span className="text-xs font-medium text-main-primary">Wishlist</span>
          </Link>
          <Link
            href="/profile/messages"
            onClick={close}
            className="flex flex-col items-center gap-1 rounded-xl p-2 text-center hover:bg-muted"
          >
            <span className="relative">
              <MessageSquare className="h-5 w-5 text-subtle" />
              <span className="absolute -right-2 -top-2">
                <MessageBadge count={messageUnreadCount} />
              </span>
            </span>
            <span className="text-xs font-medium text-main-primary">Messages</span>
          </Link>
        </div>

        {offerTags.length > 0 ? (
          <div className="px-4 py-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Deals
            </p>
            <div className="flex flex-wrap gap-2">
              {offerTags.map((tag) => (
                <Link
                  key={tag.id}
                  href={getOfferTagBrowseHref(tag.url)}
                  onClick={close}
                  className="rounded-full border border-[#7dbfa4]/40 bg-[#7dbfa4]/10 px-3 py-1 text-xs font-medium text-[#2d6b54] hover:bg-[#7dbfa4]/20"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        <Separator />

        <div className="px-4 py-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Categories
          </p>
          <ul className="space-y-1">
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/browse?category=${category.url}`}
                  onClick={close}
                  className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-main-primary hover:bg-muted"
                >
                  <Image
                    src={category.image}
                    alt={category.name}
                    width={24}
                    height={24}
                    className="h-6 w-6 rounded object-cover"
                  />
                  <span className="line-clamp-1">{category.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <Separator />

        <div className="px-4 py-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Account
          </p>
          <ul className="space-y-1">
            {accountLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={close}
                  className="block rounded-lg px-2 py-2 text-sm text-main-primary hover:bg-muted"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <Separator />

        <div className="px-4 py-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-main-primary">
            <Smartphone className="h-4 w-4" />
            Download app
          </div>
          <div className="mt-3 flex gap-2">
            <Link href="#" onClick={close} aria-label="Download on the App Store">
              <Image src={AppStoreImg} alt="App Store" width={90} height={28} className="h-8 w-auto" />
            </Link>
            <Link href="#" onClick={close} aria-label="Get it on Google Play">
              <Image src={PlayStoreImg} alt="Google Play" width={90} height={28} className="h-8 w-auto" />
            </Link>
          </div>
        </div>

        <div className="border-t px-4 py-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Ship to
          </p>
          <div className="flex items-center gap-2 text-sm text-main-primary">
            <span className={`fi fi-${userCountry.code.toLowerCase()}`} />
            <span>{userCountry.name}</span>
          </div>
          <div className="mt-3">
            <CountrySelector
              id="mobile-menu-countries"
              open={countryOpen}
              onToggle={() => setCountryOpen(!countryOpen)}
              onChange={handleCountryClick}
              selectedValue={
                countries.find((option) => option.name === userCountry?.name) ?? countries[0]
              }
            />
          </div>
        </div>

        {isSignedIn ? (
          <div className="border-t px-4 py-4">
            <SignOutButton>
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-subtle hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </SignOutButton>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
