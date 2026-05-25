import Link from "next/link";
import UserMenu from "./user-menu/user-menu";
import Cart from "./cart";
import DownloadApp from "./download-app";
import Search from "./search/search";
import { getCartItemCount } from "@/src/app/actions/cart.actions";
import { getWishlistCount } from "@/src/app/actions/wishlist.actions";
import { getTotalUnreadCount } from "@/src/app/actions/message.actions";
import WishlistHeaderLink from "@/src/components/wishlist/WishlistHeaderLink";
import MessageHeaderLink from "@/src/components/messages/MessageHeaderLink";

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

    return (
        <div className="relative z-[90] bg-[#95CFB2]">
          <div className="h-full w-full lg:flex text-white px-4 lg:px-12">
            <div className="flex lg:w-full lg:flex-1 flex-col lg:flex-row gap-3 py-3">
              <div className="flex items-center justify-between">
                <Link href="/">
                  <h1 className="text-white font-bold text-3xl font-mono">Salamo</h1>
                </Link>
                <div className="flex lg:hidden items-center gap-2">
                  <UserMenu />
                  <MessageHeaderLink count={totalMessageUnread} />
                  <WishlistHeaderLink count={totalWishlistCount} />
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
