import { Suspense } from "react";
import { headers } from "next/headers";
import { getTenantById } from "@/lib/tenant";
import { colors } from "@/lib/colors";
import { ReportEntry } from "./ReportPageInner";

export default async function ReportPage() {
  const tenantId = (await headers()).get("x-tenant-id");
  const tenant = tenantId ? await getTenantById(tenantId) : null;
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: colors.bgMain }}>
        <div className="text-center">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin mx-auto mb-4"
            style={{ borderColor: colors.primary, borderTopColor: "transparent" }} />
          <p className="text-sm" style={{ color: colors.textMuted }}>Calculating your report...</p>
        </div>
      </div>
    }>
      <ReportEntry tenant={tenant} />
    </Suspense>
  );
}
