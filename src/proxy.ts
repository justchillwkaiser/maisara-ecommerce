import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { safeRelativePath } from "@/lib/safe-redirect";

/**
 * Proxy (Next 16, menggantikan middleware).
 * Matcher hanya liput /admin dan /akaun, jadi tiada infinite loop ke /log-masuk.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Halaman yang diminta (termasuk query) supaya pelanggan kembali ke tempat
  // yang betul selepas log masuk.
  const requested = safeRelativePath(`${pathname}${request.nextUrl.search}`, "/");

  const session = await auth.api.getSession({ headers: request.headers });

  // /akaun/*: mesti log masuk
  if (pathname.startsWith("/akaun")) {
    if (!session?.user) {
      const loginUrl = new URL("/log-masuk", request.url);
      loginUrl.searchParams.set("next", requested);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // /admin/*: mesti log masuk DAN role ADMIN
  if (pathname.startsWith("/admin")) {
    if (!session?.user) {
      const loginUrl = new URL("/log-masuk", request.url);
      loginUrl.searchParams.set("next", requested);
      return NextResponse.redirect(loginUrl);
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/akaun/:path*"],
};
