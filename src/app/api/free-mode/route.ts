import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { PLAN_DAYS } from "@/lib/plan";
import { getFullState, getOrCreateState } from "@/lib/state";

export const dynamic = "force-dynamic";

/** POST /api/free-mode — فعال/غیرفعال کردن حالت تمرین آزاد پس از پایان چالش */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as { enabled?: unknown };
    if (typeof body.enabled !== "boolean") {
      return NextResponse.json({ error: "مقدار enabled نامعتبر است" }, { status: 400 });
    }

    const state = await getOrCreateState();

    // فعال‌سازی فقط پس از پایان ۳۰ روز چالش مجاز است (غیرفعال‌سازی همیشه آزاد است)
    if (body.enabled && state.currentDay <= PLAN_DAYS) {
      return NextResponse.json(
        { error: "حالت تمرین آزاد فقط بعد از اتمام چالش ۳۰ روزه فعال می‌شود" },
        { status: 400 }
      );
    }

    await db.appState.update({
      where: { id: "main" },
      data: { freeMode: body.enabled },
    });

    const fullState = await getFullState();
    return NextResponse.json({ state: fullState });
  } catch (error) {
    console.error("POST /api/free-mode failed:", error);
    return NextResponse.json({ error: "خطا در تغییر حالت تمرین آزاد" }, { status: 500 });
  }
}
