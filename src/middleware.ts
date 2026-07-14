import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("sipesa_token")?.value;
  const isAuthRoute = request.nextUrl.pathname.startsWith("/login") || request.nextUrl.pathname.startsWith("/forgot-password");
  if (!token && !isAuthRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/permissions/:path*", "/security-scan/:path*", "/students/:path*", "/parents/:path*", "/pengurus/:path*", "/users/:path*", "/classes/:path*", "/rooms/:path*", "/academic-years/:path*", "/class-guardians/:path*", "/room-guardians/:path*", "/student-class-histories/:path*", "/student-room-histories/:path*", "/reports/:path*", "/notifications/:path*", "/login", "/forgot-password"]
};
