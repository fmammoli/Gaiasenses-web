import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import createMiddleware from "next-intl/middleware";

export default createMiddleware({
  // A list of all locales that are supported
  locales: ["en", "pt"],

  // Used when no locale matches
  defaultLocale: "en",
});

// export function middleware(request: NextRequest) {
//   console.log("Middleware start");

//   //console.log(request);

//   const defaultGeolocation = {
//     latitude: "-22.8258628",
//     longitude: "-47.0771057",
//     city: "Campinas",
//   };

//   if (
//     request.nextUrl.searchParams.has("geo") ||
//     request.nextUrl.searchParams.has("lat") ||
//     request.nextUrl.searchParams.has("lon")
//   ) {
//     //console.log("Middleware: has lat or lon or city");
//     return NextResponse.next();
//   }

//   if (
//     !request.nextUrl.searchParams.has("lat") ||
//     !request.nextUrl.searchParams.has("lon")
//   ) {
//     const { geo } = request;
//     //console.log("Middleware: dont have lat lon");
//     if (geo) {
//       request.nextUrl.searchParams.set(
//         "lat",
//         geo?.latitude ?? defaultGeolocation.latitude
//       );
//       request.nextUrl.searchParams.set(
//         "lon",
//         geo?.longitude ?? defaultGeolocation.longitude
//       );
//       request.nextUrl.searchParams.set(
//         "city",
//         geo?.city ?? defaultGeolocation.city
//       );
//       if (Object.keys(geo).length > 0) {
//         request.nextUrl.searchParams.set("geo", "true");
//       } else {
//         request.nextUrl.searchParams.set("geo", "false");
//       }
//       //console.log("Middleware: ", request.nextUrl.searchParams.toString());
//     }
//     const response = NextResponse.redirect(new URL(request.nextUrl.toString()));
//     //Should test this middleware cache header to see if it solves the issue of page rendeing before it has its geolocation.
//     //response.headers.set("x-middleware-cache", "no-cache");
//     //response.headers.set("x-hello-from-middleware2", "went through middleware");
//     return response;
//   }
// }

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/",
    "/(pt|en)/:path*",
    //"/((?!api|_next/static|_next/image|favicon.ico).*)",

    // Enable redirects that add missing locales
    // (e.g. `/pathnames` -> `/en/pathnames`)
    "/((?!_next|_vercel|.*\\..*).*)",
  ],
};
