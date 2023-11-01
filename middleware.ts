import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const defaultGeolocation = {
    latitude: "-22.8258628",
    longitude: "-47.0771057",
    city: "Campinas",
  };
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
      request.nextUrl.searchParams.set("test", "has geo");
    }
    request.nextUrl.searchParams.set("test", "no geo");
    return NextResponse.redirect(new URL(request.nextUrl));
  }
}

export const config = {
  matcher: "/",
};
