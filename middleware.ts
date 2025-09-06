export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: [
    /*
     * 以下のパスを除いてミドルウェアを適用:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
