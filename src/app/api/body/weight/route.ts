import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tehranToday } from "@/lib/dates";

export const dynamic = "force-dynamic";

/** آخرین وزن‌ها (۳۶۵ روز، صعودی بر اساس تاریخ) */
async function listWeights() {
  const rows = await db.weightEntry.findMany({
    where: { stateId: "main" },
    orderBy: { date: "desc" },
    take: 365,
  });
  return rows.reverse().map((w) => ({ date: w.date, kg: w.kg }));
}

/** POST /api/body/weight — ثبت وزن امروز (تکرار همان روز = جایگزینی) */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as { kg?: unknown };
    const raw = Number(body.kg);
    if (!Number.isFinite(raw)) {
      return NextResponse.json({ error: "وزن نامعتبر است" }, { status: 400 });
    }
    // گرد کردن به یک رقم اعشار + بازه مجاز ۲۰ تا ۴۰۰ کیلوگرم
    const kg = Math.round(raw * 10) / 10;
    if (kg < 20 || kg > 400) {
      return NextResponse.json({ error: "وزن نامعتبر است (۲۰ تا ۴۰۰ کیلوگرم)" }, { status: 400 });
    }

    const date = tehranToday();
    await db.weightEntry.upsert({
      where: { date },
      create: { date, kg, stateId: "main" },
      update: { kg },
    });

    return NextResponse.json({ weights: await listWeights() });
  } catch (error) {
    console.error("POST /api/body/weight failed:", error);
    return NextResponse.json({ error: "خطا در ثبت وزن" }, { status: 500 });
  }
}
