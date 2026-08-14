import { createClient } from "@supabase/supabase-js";

export interface DLD2026Handover {
  project_id: number;
  project_name_en: string | null;
  master_project_en: string | null;
  area_name_en: string;
  project_status: string;
  percent_completed: number | null;
  project_end_date: string | null;
  no_of_units: number | null;
  no_of_buildings: number | null;
  str_area_tier: string | null;
  updated_at: string;
}

function readOnlyClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function getAll2026Handovers(): Promise<DLD2026Handover[]> {
  const supabase = readOnlyClient();
  const { data, error } = await supabase
    .from("dld_2026_handovers")
    .select("*")
    .order("project_end_date", { ascending: true });
  if (error) { console.error("[dld-2026-handovers]", error.message); return []; }
  return data ?? [];
}
