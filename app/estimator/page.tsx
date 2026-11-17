import { Suspense } from "react";
import { headers } from "next/headers";
import { getTenantById } from "@/lib/tenant";
import EstimatorPageInner from "./EstimatorPageInner";

export default async function EstimatorPage() {
  const tenantId = (await headers()).get("x-tenant-id");
  const tenant = tenantId ? await getTenantById(tenantId) : null;
  return (
    <Suspense>
      <EstimatorPageInner tenant={tenant} />
    </Suspense>
  );
}
