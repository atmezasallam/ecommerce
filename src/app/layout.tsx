//next.js
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Barlow } from "next/font/google";



//global css
import "./globals.css";


//theme provider
import { ThemeProvider } from "next-themes";

//clerk provider
import {ClerkProvider,} from '@clerk/nextjs'

//toast
import {Toaster} from "@/src/components/ui/toaster";
import{Toaster as SonnarToaster} from "@/src/components/ui/sonner";
import CartMergeOnLogin from "@/src/components/cart/CartMergeOnLogin";
import WishlistMergeOnLogin from "@/src/components/wishlist/WishlistMergeOnLogin";



// for font
const interFont= Inter({ subsets: ["latin"],}) 
const barlowFont= Barlow({
subsets:['latin'],
weight:['500','700'],
variable:"--font-barlow"
})






//metadata
export const metadata: Metadata = {
  title: "Salamo",
  /*icons:{icon:"/favicon.ico"},*/
  description: "A modern Palestinian e-commerce platform offering fast delivery, trusted sellers, and a seamless online shopping experience.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (

       <ClerkProvider>
    <html lang="en">
      <body className={`${interFont.className} ${barlowFont.variable}`}>
        <ThemeProvider
         attribute="class"
          defaultTheme="light" 
          enableSystem
           disableTransitionOnChange
           
           >
          <CartMergeOnLogin />
          <WishlistMergeOnLogin />
          {children}
          <Toaster/>
          <SonnarToaster position="bottom-left"/>
        </ThemeProvider>
      </body>
    </html>
    </ClerkProvider>
  );
}




























































