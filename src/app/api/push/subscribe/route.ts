import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

interface SubscribeBody {
  endpoint?: string;
  keys?: { p256dh?: string; auth?: string };
}

/** ذخیره اشتراک Web Push مرورگر */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as SubscribeBody;
    const endpoint = body.endpoint;
    const p256dh = body.keys?.p256dh;
    const auth = body.keys?.auth;

    if (!endpoint || !p256dh || !auth) {
      return NextResponse.json({ error: "اشتراک نامعتبر است" }, { status: 400 });
    }

    await db.pushSubscription.upsert({
      where: { endpoint },
      create: { endpoint, p256dh, auth },
      update: { p256dh, auth },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/push/subscribe failed:", error);
    return NextResponse.json({ error: "خطا در ثبت اشتراک" }, { status: 500 });
  }
}
