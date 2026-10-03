import { NextResponse } from "next/server";
import { isPushConfigured } from "@/lib/push";

export const dynamic = "force-dynamic";

/** کلید عمومی VAPID برای ثبت‌نام push در مرورگر */
export async function GET() {
  if (!isPushConfigured()) {
    return NextResponse.json({ configured: false, publicKey: null });
  }
  return NextResponse.json({
    configured: true,
    publicKey: process.env.VAPID_PUBLIC_KEY,
  });
}
