import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Server-side only. Call at the top of any /admin/* layout or page.
 * Redirects to "/" if there's no signed-in session, or the signed-in
 * user's profiles.is_admin is not true. Fails closed: any error checking
 * admin status is treated as "not admin".
 */
export async function requireAdmin(): Promise<{ id: string; email: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (error || !profile?.is_admin) redirect("/");

  return { id: user.id, email: user.email ?? "" };
}
