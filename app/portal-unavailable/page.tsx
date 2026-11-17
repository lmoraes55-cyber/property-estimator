function Message({ reason }: { reason: string | undefined }) {
  if (reason === "inactive") {
    return (
      <>
        <h1 style={{ fontSize: 22, marginBottom: 8 }}>This account is inactive</h1>
        <p style={{ color: "#4E5D56" }}>Contact your account administrator to restore access.</p>
      </>
    );
  }
  return (
    <>
      <h1 style={{ fontSize: 22, marginBottom: 8 }}>This isn&apos;t a valid client portal</h1>
      <p style={{ color: "#4E5D56" }}>Check the address and try again.</p>
    </>
  );
}

export default async function PortalUnavailablePage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;
  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif", padding: 24 }}>
      <div style={{ maxWidth: 420, textAlign: "center" }}>
        <Message reason={reason} />
      </div>
    </main>
  );
}
