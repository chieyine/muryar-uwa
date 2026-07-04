import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("muryaruwa_token")?.value;
  const { pathname } = request.nextUrl;

  // Paths that require authentication
  const protectedPaths = [
    "/dashboard",
    "/women",
    "/referrals",
    "/messages",
    "/nutrition-resilience",
    "/missed-visits",
    "/reports",
    "/admin",
  ];

  const isProtected = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );

  // If user tries to access a protected page without a token, redirect to login
  if (isProtected && !token) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    // Keep track of redirect URL
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // If user is already logged in and tries to access /login, redirect to /dashboard
  if (pathname === "/login" && token) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Allow routing to proceed
  return NextResponse.next();
}

// Config to specify matching paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
