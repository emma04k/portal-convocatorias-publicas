import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE_NAME = "auth_token";
const PRIVATE_PATHS = ["/convocatorias", "/bookmarks", "/saved-searches", "/profile"];

export function middleware(request: NextRequest) {
  const isPrivatePath = PRIVATE_PATHS.some(
    (path) => request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(`${path}/`),
  );

  if (!isPrivatePath) {
    return undefined;
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (token) {
    return undefined;
  }

  const loginUrl = new URL("/auth/login", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/convocatorias/:path*", "/bookmarks/:path*", "/saved-searches/:path*", "/profile/:path*"],
};
