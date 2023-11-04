import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const defaultGeolocation = {
    latitude: "-22.8258628",
    longitude: "-47.0771057",
    city: "Campinas",
  };

  if (
    request.nextUrl.searchParams.has("geo") ||
    request.nextUrl.searchParams.has("lat") ||
    request.nextUrl.searchParams.has("lon")
  ) {
    return NextResponse.next();
  }

  if (
    !request.nextUrl.searchParams.has("lat") ||
    !request.nextUrl.searchParams.has("lon")
  ) {
    const { geo } = request;

    if (geo) {
      request.nextUrl.searchParams.set(
        "lat",
        geo?.latitude ?? defaultGeolocation.latitude
      );
      request.nextUrl.searchParams.set(
        "lon",
        geo?.longitude ?? defaultGeolocation.longitude
      );
      request.nextUrl.searchParams.set(
        "city",
        geo?.city ?? defaultGeolocation.city
      );
      if (Object.keys(geo).length > 0) {
        request.nextUrl.searchParams.set("geo", "true");
      } else {
        request.nextUrl.searchParams.set("geo", "false");
      }
    }
    const response = NextResponse.rewrite(new URL(request.nextUrl.toString()));
    response.headers.set("x-middleware-cache", "no-cache");
    return response;
  }
}

export const config = {
  matcher: "/",
};
