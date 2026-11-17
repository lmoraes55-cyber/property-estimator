import { createServiceClient } from "@/lib/supabase/service";

export type Tenant = {
  id: string;
  slug: string;
  displayName: string;
  logoUrl: string;
  defaultManagementFee: number;
  defaultCosts: Record<string, number>;
  active: boolean;
};

const ROOT_HOSTS = new Set(["assetintel.ae", "www.assetintel.ae"]);

/** Returns the subdomain slug for a tenant request, or null for AssetIntel's
 *  own site (apex domain, www, localhost, or any Vercel preview host). */
export function extractTenantSlug(hostname: string): string | null {
  const host = hostname.split(":")[0].toLowerCase();
  if (ROOT_HOSTS.has(host) || host === "localhost" || host.endsWith(".vercel.app")) {
    return null;
  }
  if (!host.endsWith(".assetintel.ae")) return null;
  const slug = host.slice(0, -".assetintel.ae".length);
  return slug || null;
}

export async function getTenantBySlug(slug: string): Promise<Tenant | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("tenants")
    .select("id, slug, display_name, logo_url, default_management_fee, default_costs, active")
    .eq("slug", slug)
    .maybeSingle();

  // A genuine query error (e.g. transient DB outage) must not look like
  // "no such tenant" — throw so callers can tell the two apart.
  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    slug: data.slug,
    displayName: data.display_name,
    logoUrl: data.logo_url,
    defaultManagementFee: data.default_management_fee,
    defaultCosts: (data.default_costs ?? {}) as Record<string, number>,
    active: data.active,
  };
}

export async function getTenantById(id: string): Promise<Tenant | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("tenants")
    .select("id, slug, display_name, logo_url, default_management_fee, default_costs, active")
    .eq("id", id)
    .maybeSingle();

  // A genuine query error (e.g. transient DB outage) must not look like
  // "no such tenant" — throw so callers can tell the two apart.
  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    slug: data.slug,
    displayName: data.display_name,
    logoUrl: data.logo_url,
    defaultManagementFee: data.default_management_fee,
    defaultCosts: (data.default_costs ?? {}) as Record<string, number>,
    active: data.active,
  };
}
