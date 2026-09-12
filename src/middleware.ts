import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionTokenEdge } from "@/lib/admin/session-edge";

/**
 * The admin guard (plan §5.5). Every `/admin/*` path except the login screen
 * needs a valid session cookie; anything else is a 302 to `/admin/login/`.
 *
 * The signature is verified here as well as in the admin layout, so a forged
 * cookie never reaches a page that reads content, and an expired one is bounced
 * before Next renders anything.
 */

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Exactly the login screen, not every path that starts with those letters:
  // "/admin/login-historik/" must not slip past the guard.
  if (pathname === "/admin/login" || pathname === "/admin/login/") {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (await verifySessionTokenEdge(token)) {
    const response = NextResponse.next();
    // The admin is never a public page, whatever a crawler ignores in robots.txt.
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  }

  const login = new URL("/admin/login/", request.url);
  if (pathname !== "/admin" && pathname !== "/admin/") {
    login.searchParams.set("next", pathname);
  }
  return NextResponse.redirect(login, 302);
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
