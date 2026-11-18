import { headers } from "next/headers";
import { getTenantById } from "@/lib/tenant";
import DashboardLayoutInner from "./DashboardLayoutInner";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const tenantId = (await headers()).get("x-tenant-id");
  const tenant = tenantId ? await getTenantById(tenantId) : null;
  return <DashboardLayoutInner tenant={tenant}>{children}</DashboardLayoutInner>;
}
