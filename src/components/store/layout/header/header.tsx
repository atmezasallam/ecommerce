import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import UserMenu from "./user-menu/user-menu";
import Cart from "./cart";
import DownloadApp from "./download-app";
import Search from "./search/search";
import MobileHeaderMenu from "./mobile-header-menu";
import { getCartItemCount } from "@/src/app/actions/cart.actions";
import { getWishlistCount } from "@/src/app/actions/wishlist.actions";
import { getTotalUnreadCount } from "@/src/app/actions/message.actions";
import WishlistHeaderLink from "@/src/components/wishlist/WishlistHeaderLink";
import MessageHeaderLink from "@/src/components/messages/MessageHeaderLink";
import { getAllCategories } from "@/src/queries/category";
import { getAllOfferTags } from "@/src/queries/offerTag";
import { findOrCreateDbUserForClerk } from "@/src/lib/ensure-db-user";

import { cookies } from "next/headers";
import { Country } from "@/src/lib/types";
import CountryLanguageCurrencySelector from "./country-lang-curr-selector";
type HeaderProps = {
  cartCount?: number;
  wishlistCount?: number;
  messageUnreadCount?: number;
};

export default async function Header({ cartCount, wishlistCount, messageUnreadCount }: HeaderProps) {


      // Get cookies from the store
  const cookieStore = cookies();
  const userCountryCookie = cookieStore.get("userCountry");

  // Set default country if cookie is missing
  let userCountry: Country = {
    name: "Palestinian Territory, Occupied",
    city: "",
    code: "PS",
    region: "",
  };

  // If cookie exists, update the user country
  if (userCountryCookie) {
    userCountry = JSON.parse(userCountryCookie.value) as Country;
  }

  const totalCartCount = typeof cartCount === "number" ? cartCount : await getCartItemCount();
  const totalWishlistCount =
    typeof wishlistCount === "number" ? wishlistCount : await getWishlistCount();
  const totalMessageUnread =
    typeof messageUnreadCount === "number" ? messageUnreadCount : await getTotalUnreadCount();

  const [categories, offerTags, user] = await Promise.all([
    getAllCategories(),
    getAllOfferTags(),
    currentUser(),
  ]);

  let userName = user?.fullName ?? undefined;
  let userAvatar = user?.imageUrl ?? undefined;

  if (user) {
    try {
      const dbUser = await findOrCreateDbUserForClerk();
      userName = dbUser.name || userName;
      userAvatar = dbUser.image_url ?? userAvatar;
    } catch {
      // Fall back to Clerk profile fields.
    }
  }

    return (
        <div className="relative z-[90] bg-[#95CFB2]">
          <div className="h-full w-full lg:flex text-white px-3 sm:px-4 lg:px-12">
            <div className="flex lg:w-full lg:flex-1 flex-col lg:flex-row gap-2 sm:gap-3 py-2 sm:py-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <MobileHeaderMenu
                    categories={categories}
                    offerTags={offerTags}
                    userCountry={userCountry}
                    cartCount={totalCartCount}
                    wishlistCount={totalWishlistCount}
                    messageUnreadCount={totalMessageUnread}
                    isSignedIn={!!user}
                    userName={userName}
                    userAvatar={userAvatar}
                  />
                  <Link href="/" className="min-w-0">
                    <h1 className="truncate text-white font-bold text-2xl sm:text-3xl font-mono">Salamo</h1>
                  </Link>
                </div>
                <div className="flex shrink-0 items-center gap-1 lg:hidden">
                  <Cart count={totalCartCount} />
                </div>
              </div>
              <Search />
            </div>
            <div className="hidden lg:flex w-full lg:w-fit lg:mt-2 justify-end mt-1.5 pl-6">
              <DownloadApp />
              <CountryLanguageCurrencySelector userCountry={userCountry} />
              <UserMenu />
              <MessageHeaderLink count={totalMessageUnread} />
              <WishlistHeaderLink count={totalWishlistCount} />
              <Cart count={totalCartCount} />
            </div>
          </div>
        </div>
      );
    }
