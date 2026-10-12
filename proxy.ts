import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Metadata routes (robots, sitemap, icon, link-preview image) must stay
    // reachable for crawlers and logged-out visitors.
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|icon|opengraph-image|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
