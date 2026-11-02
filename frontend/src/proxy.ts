import { type NextRequest, NextResponse } from "next/server";

export const SESSION_COOKIE = "sessionid";

const GUEST_PAGES = ["/", "/sign-in", "/sign-up"];

export function proxy(request: NextRequest) {
  const loggedIn = request.cookies.has(SESSION_COOKIE);
  const guestPage = GUEST_PAGES.includes(request.nextUrl.pathname);

  if (loggedIn && guestPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  if (!loggedIn && !guestPage) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/|_next/|.*\\..*).*)"],
};
