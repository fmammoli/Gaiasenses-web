import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import pickRandomComposition from "./app/[locale]/map3/composition-picker";


export default async function middleware(request: NextRequest){
  // Step 1: Use the incoming request (example)
  const defaultLocale = request.headers.get('x-your-custom-locale') || 'en';
 
  const handleI18nRouting = createMiddleware({
    locales: ["pt", "en"],
    defaultLocale:"pt"
  });
  const {geo} = request;
  const randomComposition = pickRandomComposition()

  request.nextUrl.searchParams.set("lat",geo?.latitude || "-23.5528381")
  request.nextUrl.searchParams.set("lng",geo?.longitude || "-46.6621533")
  if(request.nextUrl.searchParams.get("composition") === null){
    request.nextUrl.searchParams.set("composition", randomComposition)
  }

  console.log(JSON.stringify(request.nextUrl))
  
  const response = handleI18nRouting(request);
  
  response.headers.set("x-your-custom-locale", defaultLocale);
  
  return response

}

// export default createMiddleware({
//   // A list of all locales that are supported
//   locales: ["pt", "en"],

//   // Used when no locale matches
//   defaultLocale: "pt",
// });

//Not working yet
//Too many redirects
// export function middleware(request: NextRequest) {
//   if (request.nextUrl.pathname.split("/").slice(-1)[0] === "map2") {
//     const header = {
//       "accept-language": request.headers.get("accept-language") ?? "en",
//     };
//     const languages = new Negotiator({ headers: header }).languages();
//     const locales = ["pt", "en"];
//     const defaultLocale = "en";

//     const res = match(languages, locales, defaultLocale);

//     const { protocol, host, pathname, searchParams } = request.nextUrl;
//     const lastPathnameItem = pathname.split("/").slice(-1)[0];
//     const newSearchParams =
//       searchParams.size > 0 ? `?${searchParams.toString()}` : "";

//     const urlString = `${protocol}//${host}/${res}/${lastPathnameItem}${newSearchParams}`;

//     const response = NextResponse.redirect(new URL(urlString));
//     return response;
//   }
//   return NextResponse.redirect(new URL(request.nextUrl.toString()));
// }

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
