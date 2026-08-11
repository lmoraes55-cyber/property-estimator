import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      service_type,
      property_id,
      full_name,
      email,
      whatsapp,
      preferred_contact,
      notes,
      form_data,
    } = body;

    const { data, error } = await supabase
      .from("service_requests")
      .insert({
        user_id: user.id,
        property_id: property_id || null,
        service_type,
        status: "submitted",
        full_name,
        email,
        whatsapp,
        preferred_contact,
        notes,
        form_data,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Notify Leon
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "AssetIntel <noreply@assetintel.ae>",
        to: "lmoraes55@gmail.com",
        subject: `New Service Request: ${service_type}`,
        text: `
New service request submitted on AssetIntel.

Service: ${service_type}
From: ${full_name} (${email})
WhatsApp: ${whatsapp || "not provided"}
Notes: ${notes || "none"}

Form data: ${JSON.stringify(form_data, null, 2)}

Request ID: ${data.id}
        `.trim(),
      });
    } catch {
      // Notification failure should not block the response
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
