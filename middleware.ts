import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const { nextUrl: url, geo } = request;
  console.log(geo?.country);
  if (request.nextUrl.pathname.startsWith("/composition")) {
    return NextResponse.rewrite(new URL("/about-2", request.url));
  }
  return NextResponse.redirect(new URL("/home", request.url));
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: "/composition",
};
