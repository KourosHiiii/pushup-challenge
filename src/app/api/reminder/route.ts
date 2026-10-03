import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getOrCreateState, getFullState } from "@/lib/state";

export const dynamic = "force-dynamic";

interface ReminderBody {
  enabled?: boolean;
  /** HH:mm */
  time?: string;
}

/** تنظیم یادآوری روزانه */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as ReminderBody;
    await getOrCreateState();

    const data: { reminderEnabled?: boolean; reminderTime?: string } = {};
    if (typeof body.enabled === "boolean") data.reminderEnabled = body.enabled;
    if (typeof body.time === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(body.time)) {
      data.reminderTime = body.time;
    }
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "چیزی برای تغییر نیست" }, { status: 400 });
    }

    await db.appState.update({ where: { id: "main" }, data });
    const state = await getFullState();
    return NextResponse.json({ ok: true, state });
  } catch (error) {
    console.error("POST /api/reminder failed:", error);
    return NextResponse.json({ error: "خطا در ذخیره تنظیمات" }, { status: 500 });
  }
}
