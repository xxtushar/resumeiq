import { createClient } from "@/lib/supabase/server";

/**
 * Daily Vercel cron target (see vercel.json). One cheap database read keeps
 * the free-tier Supabase project from pausing after 7 idle days. Public and
 * read-only: RLS returns nothing to an anonymous caller.
 */
export async function GET() {
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .select("id", { head: true, count: "exact" })
    .limit(1);

  if (error) {
    console.error("keepalive: database check failed", error.message);
    return Response.json({ ok: false }, { status: 503 });
  }
  return Response.json({ ok: true });
}
