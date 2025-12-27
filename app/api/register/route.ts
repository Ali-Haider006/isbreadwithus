export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const body = await req.json();

  try {
    // Convert base64 to blob
    const base64Data = body.paymentScreenshot.split(",")[1];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    
    // Determine file extension from base64 header
    const mimeType = body.paymentScreenshot.match(/data:image\/(.*?);/)?.[1] || "png";
    const fileExtension = mimeType === "jpeg" ? "jpg" : mimeType;
    
    // Create unique filename
    const fileName = `${Date.now()}-${body.phone.replace(/\D/g, "")}.${fileExtension}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("payment_screenshots")
      .upload(fileName, byteArray, {
        contentType: `image/${mimeType}`,
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload image: " + uploadError.message },
        { status: 400 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("payment_screenshots")
      .getPublicUrl(uploadData.path);

    // Insert into database
    const { error: dbError } = await supabase.from("registrations").insert({
      name: body.name,
      phone: body.phone,
      email: body.email,
      is_no_show: body.isNoShow,
      payment_screenshot_url: urlData.publicUrl,
    });

    if (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Failed to save registration: " + dbError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}