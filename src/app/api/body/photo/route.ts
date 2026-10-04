import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tehranToday } from "@/lib/dates";

export const dynamic = "force-dynamic";

/** حداکثر طول data URL عکس (کاراکتر) — تصویر سمت کلاینت فشرده می‌شود */
const MAX_PHOTO_LENGTH = 700_000;

type PhotoSlot = "before" | "after";

function isSlot(value: unknown): value is PhotoSlot {
  return value === "before" || value === "after";
}

/** عکس‌های قبل/بعد به شکل استاندارد پاسخ */
async function listPhotos() {
  const rows = await db.bodyPhoto.findMany({ where: { stateId: "main" } });
  const before = rows.find((p) => p.slot === "before") ?? null;
  const after = rows.find((p) => p.slot === "after") ?? null;
  return {
    before: before ? { image: before.image, date: before.date } : null,
    after: after ? { image: after.image, date: after.date } : null,
  };
}

/** POST /api/body/photo — ثبت/به‌روزرسانی عکس قبل یا بعد (data URL فشرده) */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as { slot?: unknown; image?: unknown };
    if (!isSlot(body.slot)) {
      return NextResponse.json({ error: "اسلات عکس نامعتبر است" }, { status: 400 });
    }
    const image = typeof body.image === "string" ? body.image : "";
    if (!image.startsWith("data:image/") || image.length >= MAX_PHOTO_LENGTH) {
      return NextResponse.json({ error: "عکس نامعتبر یا خیلی حجیم است" }, { status: 400 });
    }

    const date = tehranToday();
    await db.bodyPhoto.upsert({
      where: { slot: body.slot },
      create: { slot: body.slot, image, date, stateId: "main" },
      update: { image, date },
    });

    return NextResponse.json({ photos: await listPhotos() });
  } catch (error) {
    console.error("POST /api/body/photo failed:", error);
    return NextResponse.json({ error: "خطا در ثبت عکس" }, { status: 500 });
  }
}

/** DELETE /api/body/photo?slot=before|after — حذف عکس یک اسلات */
export async function DELETE(req: NextRequest) {
  try {
    const slot = req.nextUrl.searchParams.get("slot");
    if (!isSlot(slot)) {
      return NextResponse.json({ error: "اسلات عکس نامعتبر است" }, { status: 400 });
    }
    await db.bodyPhoto.deleteMany({ where: { slot, stateId: "main" } });
    return NextResponse.json({ photos: await listPhotos() });
  } catch (error) {
    console.error("DELETE /api/body/photo failed:", error);
    return NextResponse.json({ error: "خطا در حذف عکس" }, { status: 500 });
  }
}
