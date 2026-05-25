import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const protectedRoutes = createRouteMatcher([
  "/dhashboard",
  "/dashboard(.*)",
  "/profile",
  "/settings",
  "/become-a-seller",
  "/help-center(.*)",
  "/refund-policy",
  "/legal-privacy",
  "/discounts-offers",
  "/dispute-resolution",
  "/report-problem",
]);

export default clerkMiddleware(async (auth, req) => {
  if (protectedRoutes(req)) {
    await auth.protect();
  }

  // Creating a basic response
  let response = NextResponse.next();



  /*---------Handle Country detection----------*/
  // Step 1: Check if country is already set in cookies
  const countryCookie = req.cookies.get("userCountry");

  if (countryCookie) {
    // If the user has already selected a country, use that for subsequent requests
    response = NextResponse.next();
  } else {
    response = NextResponse.redirect(new URL(req.url));
    // Step 2: Set default country to Palestinian Territory, Occupied
    const defaultCountry = {
      name: "Palestinian Territory, Occupied",
      code: "PS",
      city: "",
      region: "",
    };

    // Step 3: Set a cookie with the default country for future requests
    response.cookies.set("userCountry", JSON.stringify(defaultCountry), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  }

  return response;



});





export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};

