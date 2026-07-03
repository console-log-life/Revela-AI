import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "./auth.config";

// Build an Edge-safe auth instance from the DB-free config.
// IMPORTANT: do NOT import from "@/auth" here — that module loads the MongoDB driver,
// which is not supported in the Edge runtime where middleware executes.
const { auth } = NextAuth(authConfig);

const protectedPrefixes = [
  "/dashboard",
  "/interviews",
  "/candidates",
  "/memory",
  "/analytics",
  "/insights",
  "/reports",
  "/settings",
];

const authPages = ["/login", "/signup", "/forgot-password"];

export default auth((req) => {
  const pathname = req.nextUrl.pathname;
  const hasSession = !!req.auth;

  const isProtected = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  );

  const isAuthPage = authPages.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isProtected && !hasSession) {
    const loginUrl = new URL("/login", req.nextUrl);

    loginUrl.searchParams.set("callbackUrl", pathname);

    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/interviews/:path*",
    "/candidates/:path*",
    "/memory/:path*",
    "/analytics/:path*",
    "/insights/:path*",
    "/reports/:path*",
    "/settings/:path*",
    "/login",
    "/signup",
    "/forgot-password",
  ],
};
