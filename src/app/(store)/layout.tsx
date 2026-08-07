// React
import { ReactNode } from "react";
import CategoriesHeader from "@/src/components/store/layout/categories-header/categories-header";
import Footer from "@/src/components/store/layout/footer/footer";
// components / Header
import Header from "@/src/components/store/layout/header/header";
import { getCartItemCount } from "@/src/app/actions/cart.actions";
import { getWishlistCount } from "@/src/app/actions/wishlist.actions";
import { getTotalUnreadCount } from "@/src/app/actions/message.actions";

import {Toaster} from "react-hot-toast";

export default async function StoreLayout({ children }: { children: ReactNode }) {
  const [cartCount, wishlistCount, messageUnreadCount] = await Promise.all([
    getCartItemCount(),
    getWishlistCount(),
    getTotalUnreadCount(),
  ]);

  return (
    <div className="overflow-x-hidden">
        <Header
          cartCount={cartCount}
          wishlistCount={wishlistCount}
          messageUnreadCount={messageUnreadCount}
        />
        <CategoriesHeader />
      <div>{children}</div>
      <Footer />
      <Toaster position="top-center" />
    </div>
  );
}